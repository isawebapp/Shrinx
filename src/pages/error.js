// src/pages/error.js

export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white border border-gray-300 rounded-lg p-6 w-80 shadow-md text-center">
        <h1 className="text-xl mb-4">404 – Not Found</h1>
        <p className="mb-4">The page you’re looking for doesn’t exist.</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="uppercase text-sm font-medium py-2 px-4 border border-black rounded hover:bg-black hover:text-white"
        >
          Home
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {}
  };
}
