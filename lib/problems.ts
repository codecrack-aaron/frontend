// Static list of problems to display on the site
// Problems can exist in the backend (test_sets_repo) without being shown here
// This allows testing new problems internally before making them public

export const PROBLEMS = [
  { id: 'two_sum', title: 'Two Sum', difficulty: 'Easy' as const },
  { id: 'add_list', title: 'Add Numbers', difficulty: 'Easy' as const },
  { id: 'is_palindrome', title: 'Is Palindrome', difficulty: 'Easy' as const },
] as const;

export type Problem = typeof PROBLEMS[number];
export type ProblemId = Problem['id'];
export type Difficulty = Problem['difficulty'];
