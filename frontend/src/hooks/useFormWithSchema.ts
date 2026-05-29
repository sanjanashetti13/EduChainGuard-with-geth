import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Standard RHF + Zod wiring for EduChainGuard forms.
 */
export function useFormWithSchema<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues>,
  options?: Omit<UseFormProps<TFieldValues>, "resolver"> & {
    defaultValues?: DefaultValues<TFieldValues>;
  }
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    ...options,
    resolver: zodResolver(schema),
  });
}
