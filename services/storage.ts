
import { User, Question, TestResult, AppSettings } from '../types';
import { INITIAL_USERS, INITIAL_QUESTIONS } from '../constants';

const KEYS = {
  USERS: 'k12_users',
  QUESTIONS: 'k12_questions',
  RESULTS: 'k12_results',
  AUTH: 'k12_auth',
  SETTINGS: 'k12_settings'
};

const DEFAULT_SETTINGS: AppSettings = {
  questionsPerTest: 10
};

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  },

  getQuestions: (): Question[] => {
    const data = localStorage.getItem(KEYS.QUESTIONS);
    if (!data) {
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    return JSON.parse(data);
  },

  saveQuestions: (questions: Question[]) => {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getResults: (): TestResult[] => {
    const data = localStorage.getItem(KEYS.RESULTS);
    return data ? JSON.parse(data) : [];
  },

  saveResult: (result: TestResult) => {
    const current = storage.getResults();
    localStorage.setItem(KEYS.RESULTS, JSON.stringify([...current, result]));
  },

  setAuth: (user: User | null) => {
    localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
  },

  getAuth: (): User | null => {
    const data = localStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};
