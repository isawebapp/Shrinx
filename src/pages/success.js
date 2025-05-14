// src/pages/success.js

export default function Success({ path, domain }) {
  const shortUrl = `${domain}/url/${path}`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white border border-gray-300 rounded-lg p-6 w-80 shadow-md text-center">
        <h1 className="text-xl mb-4">URL Created!</h1>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
          <p className="text-sm break-all">{shortUrl}</p>
        </div>
        <button
          onClick={() => (window.location.href = "/")}
          className="uppercase text-sm font-medium py-2 px-4 border border-black rounded hover:bg-black hover:text-white"
        >
          New Short URL
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const { path = "", domain = "" } = query;
  return {
    props: {
      path,
      domain,
    },
  };
}
