import Link from "next/link";

function NotFound() {
  return (
    <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center wrapper">
        <div className="w-1/4 mx-auto">
          <img src="/404.svg" alt="Error" className="block w-full"/>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          PAGE NOT FOUND
        </h2>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          The page you are looking for might have been removed
          <br />
          had its name changed or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="inline-block bg-black text-white font-semibold px-8 py-3 rounded-lg transition-transform duration-300 ease-in-out transform hover:scale-102"
          >
            GO TO HOMEPAGE
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
