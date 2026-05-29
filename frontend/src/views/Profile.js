import React from "react";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <>
      <main className="profile-page">
        <section className="relative block h-500-px bg-gradient-to-br from-slate-800 to-blue-900">
          <span className="absolute inset-0 bg-black opacity-40" aria-hidden />
          <div
            className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
            style={{ transform: "translateZ(0)" }}
          >
            <svg
              className="absolute bottom-0 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="text-blueGray-200 fill-current"
                points="2560 0 2560 100 0 100"
              />
            </svg>
          </div>
        </section>
        <section className="relative py-16 bg-blueGray-200">
          <div className="container mx-auto px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
              <div className="px-6">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                    <div className="relative">
                      <span
                        className="shadow-xl flex h-[150px] w-[150px] items-center justify-center rounded-full border-none bg-blueGray-200 text-5xl text-blueGray-600 absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                        aria-hidden
                      >
                        <i className="fas fa-user" />
                      </span>
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center" />
                </div>
                <div className="text-center mt-12">
                  <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700">
                    {user?.name || "User"}
                  </h3>
                  <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                    <i className="fas fa-envelope mr-2 text-lg text-blueGray-400" />
                    {user?.email || "—"}
                  </div>
                  <div className="mt-4 text-blueGray-600">
                    <i className="fas fa-user-tag mr-2 text-lg text-blueGray-400" />
                    Role:{" "}
                    <span className="capitalize">{user?.role || "N/A"}</span>
                  </div>
                </div>
                <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                  <div className="flex flex-wrap justify-center">
                    <div className="w-full lg:w-9/12 px-4">
                      <p className="mb-4 text-lg leading-relaxed text-blueGray-700">
                        Your EduChainGuard profile. Use the navigation to upload
                        certificates, verify records, or manage your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
