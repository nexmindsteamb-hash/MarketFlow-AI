export default function ContentStudio(){
    return(
        <div className="flex min-h-screen bg-[#090A0E]">
      {/* <Sidebar /> */}

      <main className="min-w-0 flex-1 p-8 text-white">
        <h1 className="text-2xl font-bold">
          AI Content Studio
        </h1>

        <p className="mt-2 text-sm text-[#8491A8]">
          Select approved company records to generate targeted captions, hashtags, and social descriptions.
        </p>
      </main>
    </div>
    )
}