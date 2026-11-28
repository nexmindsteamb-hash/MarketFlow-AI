
import { Link } from "react-router-dom";

function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLabel,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090A0E] px-4 py-8">
       <section className="w-full max-w-[460px] rounded-[24px] border border-[#252B3A] bg-[#11141C] px-6 py-7 shadow-2xl sm:px-9 sm:py-9">

        {/* Header */}
          <header className="mb-5 text-center">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-extrabold text-black">
            M
          </div>

            <span className="text-[22px] font-bold tracking-tight text-white">
              MarketFlow AI
            </span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>

          <p className="mt-2 text-[15px] text-[#9CAFCB]">
            {subtitle}
          </p>
        </header>

        {/* Form */}
        {children}

        {/* Footer */}

        <footer className="mt-7">
          <p className="text-center text-[15px] text-[#9CAFCB]">
            {footerText}{" "}
            <Link
              to={footerLink}
              className="ml-1 font-semibold text-white transition hover:text-[#B9C9E5]"
            >
              {footerLabel}
            </Link>
          </p>

           
          {/*  <div className="flex items-center justify-center gap-5 text-center">
              <svg
                className="h-4 w-4 shrink-0 text-[#8291A8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M12 3 5.5 6v5.5c0 4.2 2.8 7.7 6.5 9.5 3.7-1.8 6.5-5.3 6.5-9.5V6L12 3Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p className="text-xs leading-5 text-[#7185A5]">
                Module assigned to:{" "}
                <span className="font-semibold text-[#91A5C5]">
                  Roshani Khan
                </span>{" "}
                (Frontend) &{" "}
                <span className="font-semibold text-[#91A5C5]">
                  Garima Singh
                </span>
                <br />
                (Backend Auth)
              </p>
            </div>*/}
        </footer>
      </section>
    </main>
  );
}

export default AuthLayout;
