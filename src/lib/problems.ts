import { allProblems } from '../../problems/index'
import type { Problem, Difficulty, Topic } from '@/types/problem'

export function getAllProblems(): Problem[] {
  return allProblems
}

export function getProblemBySlug(slug: string): Problem | null {
  return allProblems.find(p => p.slug === slug) ?? null
}

export function getProblemsByTopic(topic: Topic): Problem[] {
  return allProblems.filter(p => p.topic === topic)
}

export function getProblemsByDifficulty(difficulty: Difficulty): Problem[] {
  return allProblems.filter(p => p.difficulty === difficulty)
}
