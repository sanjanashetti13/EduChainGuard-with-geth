from flask import Flask, request, jsonify
from web3 import Web3
import json
import os
import hashlib
from io import BytesIO
from dotenv import load_dotenv
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import requests
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads/institute"
ALLOWED_EXTENSIONS = {"pdf"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Optional JWT secret (for future use / consistency with .env)
app.config["JWT_SECRET"] = os.getenv("JWT_SECRET", "dev-change-me")

# --- MongoDB (env-driven) ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "educhain")

mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=8000)
db = mongo_client[MONGO_DB_NAME]
users_collection = db["users"]
uploads_collection = db["uploads"]

try:
    mongo_client.admin.command("ping")
    print("MongoDB Connected:", MONGO_URI, "database:", MONGO_DB_NAME)
except Exception as e:
    print("MongoDB connection failed — is mongod running? Error:", e)

# --- Blockchain (optional: server still starts if RPC or .env is wrong) ---
w3 = None
contract = None
wallet_address = None
private_key = None
BLOCKCHAIN_READY = False


def _init_blockchain():
    global w3, contract, wallet_address, private_key, BLOCKCHAIN_READY
    ca = os.getenv("CONTRACT_ADDRESS")
    wa = os.getenv("WALLET_ADDRESS")
    pk = os.getenv("PRIVATE_KEY")
    rpc = os.getenv("POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology")

    if not all([ca, wa, pk]):
        print("Blockchain disabled: set CONTRACT_ADDRESS, WALLET_ADDRESS, PRIVATE_KEY in .env")
        return

    try:
        w3 = Web3(Web3.HTTPProvider(rpc))
        if not w3.is_connected():
            print("Blockchain disabled: cannot reach RPC:", rpc)
            return

        contract_address = Web3.to_checksum_address(ca)
        wallet_address = Web3.to_checksum_address(wa)
        private_key = pk

        abi_path = os.path.join(os.path.dirname(__file__), "contract_abi.json")
        with open(abi_path) as f:
            abi = json.load(f)

        contract = w3.eth.contract(address=contract_address, abi=abi)
        BLOCKCHAIN_READY = True
        print("Blockchain ready (Amoy / contract):", contract_address)
    except Exception as e:
        print("Blockchain init failed:", e)


_init_blockchain()


def _raw_tx_bytes(signed_txn):
    return getattr(signed_txn, "raw_transaction", None) or getattr(
        signed_txn, "rawTransaction", None
    )


def require_blockchain():
    if not BLOCKCHAIN_READY:
        return (
            jsonify(
                {
                    "error": "Blockchain is not configured on the server. "
                    "Check CONTRACT_ADDRESS, WALLET_ADDRESS, PRIVATE_KEY, and RPC."
                }
            ),
            503,
        )
    return None


def google_auth_enabled():
    return os.getenv("GOOGLE_AUTH_ENABLED", "true").lower() not in (
        "0",
        "false",
        "no",
        "off",
    )


def verify_google_id_token(token):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if client_id:
        return id_token.verify_oauth2_token(
            token, grequests.Request(), audience=client_id
        )
    return id_token.verify_oauth2_token(token, grequests.Request())


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def hash_pdf(file):
    pdf_bytes = file.read()
    file.seek(0)
    return hashlib.sha256(pdf_bytes).hexdigest()


@app.route("/test", methods=["GET"])
def test_backend():
    return "Backend working"


@app.route("/api/auth/manual-register", methods=["POST"])
def manual_register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return jsonify({"error": "Missing required fields"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    users_collection.insert_one(
        {
            "name": name,
            "email": email,
            "password": hashed_pw,
            "role": role,
            "auth": "manual",
        }
    )

    return jsonify({"message": "User registered successfully"}), 200


@app.route("/api/auth/manual-login", methods=["POST"])
def manual_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.get("auth") == "google" or user.get("password") is None:
        return jsonify(
            {"error": "This account uses Google sign-in. Use Google login instead."}
        ), 403

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Incorrect password"}), 401

    return jsonify(
        {
            "message": "Login successful",
            "user": {
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
        }
    ), 200


@app.route("/api/auth/login", methods=["POST"])
def manual_login_alias():
    return manual_login()


@app.route("/api/auth/google-login", methods=["POST"])
def google_login():
    if not google_auth_enabled():
        return jsonify({"error": "Google sign-in is disabled on this server."}), 503

    data = request.get_json()
    token = data.get("token")

    try:
        idinfo = verify_google_id_token(token)
        email = idinfo.get("email").strip().lower()
        name = idinfo.get("name")

        user = users_collection.find_one({"email": email})

        if user:
            if user.get("auth") == "google":
                return jsonify(
                    {
                        "message": "Google user exists",
                        "user": {
                            "name": user["name"],
                            "email": user["email"],
                            "role": user["role"],
                        },
                    }
                ), 200
            return jsonify(
                {
                    "error": "This email is registered manually. Please login using password."
                }
            ), 403

        return jsonify(
            {"newUser": True, "name": name, "email": email, "token": token}
        ), 200

    except Exception as e:
        return jsonify({"error": f"Invalid token: {str(e)}"}), 400


@app.route("/api/auth/google-register", methods=["POST"])
def google_register():
    if not google_auth_enabled():
        return jsonify({"error": "Google sign-in is disabled on this server."}), 503

    data = request.get_json()
    token = data.get("token")
    role = data.get("role")

    try:
        idinfo = verify_google_id_token(token)
        email = idinfo.get("email").strip().lower()
        name = idinfo.get("name")

        if users_collection.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 400

        users_collection.insert_one(
            {
                "name": name,
                "email": email,
                "password": None,
                "role": role,
                "auth": "google",
            }
        )

        return jsonify(
            {
                "message": "Google user registered successfully",
                "user": {
                    "name": name,
                    "email": email,
                    "role": role,
                },
            }
        ), 200

    except Exception as e:
        return jsonify({"error": f"Token verification failed: {str(e)}"}), 400


@app.route("/upload", methods=["POST"])
def upload():
    err = require_blockchain()
    if err:
        return err
    data = request.get_json()
    try:
        cert_hash = bytes.fromhex(data.get("hash"))

        nonce = w3.eth.get_transaction_count(wallet_address)
        txn = contract.functions.uploadCertificate(cert_hash).build_transaction(
            {
                "chainId": 80002,
                "gas": 300000,
                "gasPrice": w3.to_wei("30", "gwei"),
                "nonce": nonce,
            }
        )

        signed_txn = w3.eth.account.sign_transaction(txn, private_key)
        raw = _raw_tx_bytes(signed_txn)
        tx_hash = w3.eth.send_raw_transaction(raw)

        return jsonify({"tx_hash": tx_hash.hex()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/verify", methods=["POST"])
def verify():
    err = require_blockchain()
    if err:
        return err
    data = request.get_json()
    try:
        cert_hash = bytes.fromhex(data.get("hash"))
        result = contract.functions.verifyCertificate(cert_hash).call()
        return jsonify({"verified": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/institute/upload", methods=["POST"])
def institute_upload():
    email = request.form.get("email")
    file = request.files.get("file")

    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    file.seek(0)
    cert_hash = hash_pdf(file)

    err = require_blockchain()
    if err:
        return err

    try:
        nonce = w3.eth.get_transaction_count(wallet_address)
        txn = contract.functions.uploadCertificate(
            bytes.fromhex(cert_hash)
        ).build_transaction(
            {
                "chainId": 80002,
                "gas": 300000,
                "gasPrice": w3.to_wei("30", "gwei"),
                "nonce": nonce,
            }
        )
        signed_txn = w3.eth.account.sign_transaction(txn, private_key)
        raw = _raw_tx_bytes(signed_txn)
        tx_hash = w3.eth.send_raw_transaction(raw)

        uploads_collection.insert_one(
            {
                "email": email,
                "filename": filename,
                "filepath": filepath,
                "hash": cert_hash,
                "tx_hash": tx_hash.hex(),
            }
        )

        return jsonify(
            {"message": "Uploaded to blockchain", "tx_hash": tx_hash.hex()}
        ), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/institute/uploads/<email>", methods=["GET"])
def get_institute_uploads(email):
    uploads = list(uploads_collection.find({"email": email}, {"_id": 0}))
    return jsonify(uploads)


@app.route("/institute/record-upload", methods=["POST"])
def institute_record_upload():
    """Store upload metadata after client signs tx on Local Geth (no server-side Web3)."""
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    tx_hash = data.get("tx_hash")
    cert_hash = data.get("hash")
    filename = data.get("filename", "certificate")
    if not all([email, tx_hash, cert_hash]):
        return jsonify({"error": "email, tx_hash, and hash are required"}), 400
    uploads_collection.insert_one(
        {
            "email": email,
            "filename": filename,
            "filepath": None,
            "hash": cert_hash,
            "tx_hash": tx_hash,
        }
    )
    return jsonify({"message": "Upload recorded"}), 200


@app.route("/verifier/record-verify", methods=["POST"])
def verifier_record_verify():
    """Log verifier check after client read from chain (no server-side Web3)."""
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    cert_hash = data.get("hash")
    verified = data.get("verified")
    if email is None or cert_hash is None or verified is None:
        return jsonify({"error": "email, hash, and verified are required"}), 400
    db["verifications"].insert_one(
        {
            "email": email,
            "hash": cert_hash,
            "verified": bool(verified),
            "timestamp": datetime.utcnow(),
        }
    )
    return jsonify({"message": "Verification recorded"}), 200


@app.route("/verifier/verify-pdf", methods=["POST"])
def verifier_verify_pdf():
    file = request.files.get("file")
    email = request.form.get("email")

    if not file or not allowed_file(file.filename) or not email:
        return jsonify({"error": "Invalid input"}), 400

    file.seek(0)
    cert_hash = hash_pdf(file)

    err = require_blockchain()
    if err:
        return err

    try:
        result = contract.functions.verifyCertificate(
            bytes.fromhex(cert_hash)
        ).call()

        db["verifications"].insert_one(
            {
                "email": email,
                "hash": cert_hash,
                "verified": result,
                "timestamp": datetime.utcnow(),
            }
        )

        return jsonify({"verified": result, "hash": cert_hash})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/uploads-per-day", methods=["GET"])
def uploads_per_day():
    try:
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        days = []

        for i in range(6, -1, -1):
            start = today - timedelta(days=i)
            end = start + timedelta(days=1)

            count = uploads_collection.count_documents(
                {
                    "_id": {
                        "$gte": ObjectId.from_datetime(start),
                        "$lt": ObjectId.from_datetime(end),
                    }
                }
            )

            days.append({"date": start.strftime("%b %d"), "count": count})

        return jsonify(days)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/user-activity", methods=["GET"])
def get_user_activity():
    try:
        users = list(
            users_collection.find({}, {"_id": 0, "name": 1, "email": 1, "role": 1})
        )
        uploads = list(
            uploads_collection.find({}, {"_id": 0, "email": 1, "filename": 1, "tx_hash": 1})
        )

        upload_map = {}
        for upload in uploads:
            upload_map.setdefault(upload["email"], []).append(
                {"filename": upload["filename"], "tx_hash": upload["tx_hash"]}
            )

        for user in users:
            user["uploads"] = (
                upload_map.get(user["email"], []) if user["role"] == "institute" else []
            )
            user["verifications"] = []

        categorized = {
            "admin": [u for u in users if u["role"] == "admin"],
            "institute": [u for u in users if u["role"] == "institute"],
            "verifier": [u for u in users if u["role"] == "verifier"],
        }

        return jsonify(categorized)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/user-activity-details", methods=["GET"])
def get_user_activity_table():
    try:
        users = list(users_collection.find({}, {"_id": 0}))
        categorized = {"admin": [], "institute": [], "verifier": []}

        for user in users:
            role = user["role"]
            if role == "institute":
                user["uploads"] = list(
                    uploads_collection.find({"email": user["email"]}, {"_id": 0})
                )
            elif role == "verifier":
                user["verifications"] = list(
                    db["verifications"].find({"email": user["email"]}, {"_id": 0})
                )
            categorized[role].append(user)

        return jsonify(categorized)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/stats", methods=["GET"])
def get_admin_stats():
    try:
        total_uploads = uploads_collection.count_documents({})
        total_verified = db["verifications"].count_documents({})

        user_roles = {
            "admin": users_collection.count_documents({"role": "admin"}),
            "institute": users_collection.count_documents({"role": "institute"}),
            "verifier": users_collection.count_documents({"role": "verifier"}),
        }

        recent_uploads = list(
            uploads_collection.find(
                {}, {"_id": 0, "email": 1, "filename": 1, "hash": 1, "tx_hash": 1}
            )
            .sort("_id", -1)
            .limit(5)
        )

        return jsonify(
            {
                "totalUploads": total_uploads,
                "totalVerified": total_verified,
                "users": user_roles,
                "recent": recent_uploads,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/verifier-activity", methods=["GET"])
def get_verifier_activity():
    try:
        users_raw = list(users_collection.find({"role": "verifier"}))
        verifications_raw = list(db["verifications"].find({}))

        def safe_json(doc):
            sanitized = {}
            for k, v in doc.items():
                if isinstance(v, bytes):
                    sanitized[k] = v.hex()
                elif isinstance(v, datetime):
                    sanitized[k] = v.isoformat()
                elif isinstance(v, ObjectId):
                    sanitized[k] = str(v)
                else:
                    sanitized[k] = v
            return sanitized

        verifications = [safe_json(v) for v in verifications_raw]

        result = []
        for user in users_raw:
            email = user.get("email", "")
            safe_user = safe_json(user)
            safe_user["verifications"] = [
                v for v in verifications if v.get("email") == email
            ]
            result.append(safe_user)

        return jsonify({"verifier": result})

    except Exception as e:
        print("Error in /admin/verifier-activity:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/admin/clear-logs", methods=["DELETE"])
def clear_certificate_logs():
    try:
        db["uploads"].delete_many({})
        db["verifications"].delete_many({})
        return jsonify({"message": "All certificate logs cleared."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Pinata IPFS (separate module: does not interact with blockchain) ---


def _clean_env_secret(value):
    """Strip whitespace and accidental wrapping quotes from .env values."""
    s = (value or "").strip()
    if len(s) >= 2 and s[0] == s[-1] and s[0] in "\"'":
        s = s[1:-1].strip()
    return s


def _pinata_error_message(resp):
    """Normalize Pinata error JSON (shape varies)."""
    try:
        err_body = resp.json()
    except Exception:
        return (resp.text or "Empty response")[:800]

    err = err_body.get("error")
    if isinstance(err, dict):
        return (
            err.get("details")
            or err.get("reason")
            or err.get("message")
            or str(err)
        )
    if isinstance(err, str):
        return err
    return (
        err_body.get("message")
        or err_body.get("reason")
        or str(err_body)
    )[:800]


PINATA_V3_UPLOAD_URL = "https://uploads.pinata.cloud/v3/files"
PINATA_LEGACY_PIN_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"


def _pinata_extract_cid(payload):
    """CID from V3 `{data:{cid}}` or legacy `{IpfsHash}`."""
    if not isinstance(payload, dict):
        return None
    data = payload.get("data")
    if isinstance(data, dict) and data.get("cid"):
        return data["cid"]
    return (
        payload.get("cid")
        or payload.get("IpfsHash")
        or payload.get("IpfsPinHash")
        or payload.get("ipfsPinHash")
    )


def _pinata_gateway_url(cid):
    base = (
        os.getenv("PINATA_GATEWAY_URL", "").strip().rstrip("/")
        or "https://gateway.pinata.cloud/ipfs"
    )
    if base.endswith("/ipfs"):
        return "{}/{}".format(base, cid)
    return "{}/ipfs/{}".format(base, cid)


@app.route("/upload-to-pinata", methods=["POST"])
def upload_to_pinata():
    """
    Multipart upload to Pinata IPFS. Reads PINATA_JWT (preferred) or
    PINATA_API_KEY / PINATA_SECRET_API_KEY from the environment.
    """
    pinata_jwt = _clean_env_secret(os.getenv("PINATA_JWT"))
    if pinata_jwt.lower().startswith("bearer "):
        pinata_jwt = pinata_jwt[7:].strip()
    pinata_key = _clean_env_secret(os.getenv("PINATA_API_KEY"))
    pinata_secret = _clean_env_secret(os.getenv("PINATA_SECRET_API_KEY"))

    if not pinata_jwt and not (pinata_key and pinata_secret):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Pinata is not configured. Set PINATA_JWT or PINATA_API_KEY and PINATA_SECRET_API_KEY.",
                }
            ),
            503,
        )

    try:
        if "file" not in request.files:
            return jsonify({"success": False, "error": "Missing multipart field 'file'."}), 400

        fh = request.files["file"]
        if not fh or fh.filename is None or fh.filename.strip() == "":
            return jsonify({"success": False, "error": "No file selected."}), 400

        filename = secure_filename(fh.filename) or "file"
        mime = fh.mimetype or "application/octet-stream"
        content = fh.read()

        def upload_v3_bearer(token):
            s = BytesIO(content)
            s.seek(0)
            return requests.post(
                PINATA_V3_UPLOAD_URL,
                headers={"Authorization": "Bearer {}".format(token)},
                files={"file": (filename, s, mime)},
                data={
                    "network": "public",
                    "name": filename,
                },
                timeout=180,
            )

        def upload_legacy(h):
            s = BytesIO(content)
            s.seek(0)
            return requests.post(
                PINATA_LEGACY_PIN_URL,
                headers=h,
                files={"file": (filename, s, mime)},
                timeout=180,
            )

        cid = None
        errors_logged = []

        if pinata_jwt:
            # Current Pinata keys are JWT-only for V3; legacy often rejects new JWT scopes.
            resp = upload_v3_bearer(pinata_jwt)
            if resp.status_code == 200:
                try:
                    cid = _pinata_extract_cid(resp.json())
                except Exception as ex:
                    errors_logged.append("V3 parse error: {}".format(ex))
                if cid:
                    return jsonify(
                        {
                            "success": True,
                            "cid": cid,
                            "url": _pinata_gateway_url(cid),
                        }
                    )
            errors_logged.append(
                "V3 upload (HTTP {}): {}".format(
                    resp.status_code, _pinata_error_message(resp)
                )
            )

            # Fallback: legacy pinning with same JWT (older accounts)
            resp2 = upload_legacy(
                {"Authorization": "Bearer {}".format(pinata_jwt)}
            )
            if resp2.status_code == 200:
                try:
                    cid = _pinata_extract_cid(resp2.json())
                except Exception as ex:
                    errors_logged.append("Legacy parse error: {}".format(ex))
                if cid:
                    return jsonify(
                        {
                            "success": True,
                            "cid": cid,
                            "url": _pinata_gateway_url(cid),
                        }
                    )
            errors_logged.append(
                "Legacy pin (HTTP {}): {}".format(
                    resp2.status_code, _pinata_error_message(resp2)
                )
            )
        else:
            resp3 = upload_legacy(
                {
                    "pinata_api_key": pinata_key,
                    "pinata_secret_api_key": pinata_secret,
                }
            )
            if resp3.status_code != 200:
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "Pinata API error (HTTP {}): {}".format(
                                resp3.status_code, _pinata_error_message(resp3)
                            ),
                        }
                    ),
                    502,
                )
            try:
                cid = _pinata_extract_cid(resp3.json())
            except Exception as ex:
                return (
                    jsonify(
                        {"success": False, "error": "Pinata response unreadable: {}".format(ex)}
                    ),
                    502,
                )

        if not cid:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Pinata uploads failed — {}".format(
                            " | ".join(errors_logged)
                            if errors_logged
                            else "no CID returned (check JWT and Pinata dashboard permissions)."
                        ),
                    }
                ),
                502,
            )

        return jsonify({"success": True, "cid": cid, "url": _pinata_gateway_url(cid)})

    except requests.RequestException as e:
        return jsonify({"success": False, "error": "Upstream request failed: {}".format(e)}), 502
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    print("Starting Flask on http://127.0.0.1:%s" % port)
    app.run(debug=True, host="0.0.0.0", port=port)
