
export default function AuthInput({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = true,
  error,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-[15px] font-semibold text-[#DCE4F0]"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-[#191E2A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#9CAFCB] focus:border-[#64748B] focus:ring-2 focus:ring-[#64748B]/20 ${
          error
            ? "border-red-500"
            : "border-[#2B3448] hover:border-[#414D63]"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
