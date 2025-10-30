import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold">CodeCrack</h1>
        <p className="text-xl text-gray-600">
          Practice coding problems in multiple languages
        </p>
        <Link
          href="/problems"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
        >
          View Problems
        </Link>
      </main>
    </div>
  );
}
