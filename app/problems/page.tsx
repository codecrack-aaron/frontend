import Link from 'next/link';
import { PROBLEMS } from '@/lib/problems';

export default function ProblemsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Problems</h1>

        <div className="space-y-4">
          {PROBLEMS.map((problem) => (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className="block border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{problem.title}</h2>
                  <p className="text-gray-600">Problem ID: {problem.id}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    problem.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-800'
                      : problem.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
