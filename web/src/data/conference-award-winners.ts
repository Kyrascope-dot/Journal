export type AwardEntry = {
  name: string;
  score: number;
  tied?: boolean;
};

export type TrackAwards = {
  track: string;
  bestPresenter: AwardEntry[];
  phdScholarBestPresenter: AwardEntry[];
  runnerUps: AwardEntry[];
  phdScholarRunnerUps: AwardEntry[];
};

/** Official GCR International Conference 2026 — Best Presenter Award results. */
export const CONFERENCE_AWARD_WINNERS: TrackAwards[] = [
  {
    track: "Track 1",
    bestPresenter: [{ name: "Aman Dhanuka", score: 84 }],
    phdScholarBestPresenter: [{ name: "Mehak Jindal", score: 84 }],
    runnerUps: [
      { name: "Aaryan Bakshi", score: 82, tied: true },
      { name: "Abhiuday Maini", score: 82, tied: true },
      { name: "Ruhaan Gulati", score: 82, tied: true },
    ],
    phdScholarRunnerUps: [
      { name: "Muskan", score: 79, tied: true },
      { name: "Asmita Sachdeva", score: 79, tied: true },
      { name: "Tanzila Naseem", score: 78 },
    ],
  },
  {
    track: "Track 2",
    bestPresenter: [{ name: "Vihana Gaidhani", score: 86 }],
    phdScholarBestPresenter: [],
    runnerUps: [
      { name: "Zeus Lalani", score: 84 },
      { name: "Mehak Dhawan", score: 83 },
      { name: "Aditya Singh", score: 82 },
    ],
    phdScholarRunnerUps: [],
  },
  {
    track: "Track 3",
    bestPresenter: [{ name: "Amaira Jain", score: 86 }],
    phdScholarBestPresenter: [],
    runnerUps: [
      { name: "Yashvi Jhunjhunwala", score: 84 },
      { name: "Suvenaa Tayal", score: 81 },
      { name: "Suhani Mehta", score: 80, tied: true },
      { name: "Suryavir Bhandari", score: 80, tied: true },
    ],
    phdScholarRunnerUps: [],
  },
  {
    track: "Track 4",
    bestPresenter: [
      { name: "Kabir Halela", score: 82, tied: true },
      { name: "Shiv Mandlik", score: 82, tied: true },
    ],
    phdScholarBestPresenter: [],
    runnerUps: [
      { name: "Aanika Asnani", score: 81, tied: true },
      { name: "Diya Nigam", score: 81, tied: true },
      { name: "Krishiv Sharma", score: 81, tied: true },
    ],
    phdScholarRunnerUps: [],
  },
  {
    track: "Track 5",
    bestPresenter: [
      { name: "Aditya Arora", score: 85, tied: true },
      { name: "Maahit Upadhyaya", score: 85, tied: true },
    ],
    phdScholarBestPresenter: [],
    runnerUps: [
      { name: "Arhaan Sharma", score: 84 },
      { name: "Mihika Singh", score: 82 },
      { name: "Ridit Aggarwal", score: 80 },
    ],
    phdScholarRunnerUps: [],
  },
];

export const AWARD_WINNERS_INTRO =
  "Global Confluence Review (GCR) is pleased to recognise the outstanding presenters of the GCR International Multidisciplinary Conference 2026. The Best Presenter Awards are based on the presentation evaluation scores recorded across the respective conference tracks.";

export const AWARD_WINNERS_SCORE_NOTE =
  "Scores shown above reflect the presentation evaluation scores recorded for the respective conference tracks. PhD Scholar presenters are evaluated separately within the PhD Scholar category. Where candidates received equal scores, the result is presented as a tie rather than assigning an artificial ranking.";

export const AWARD_WINNERS_EMAIL_NOTE =
  "Best Presenter Awardees and Runner-Ups will be intimated via email.";

export const Q2_AWARD_RESULTS_MARQUEE =
  "Quarter II (April–June) Best Presenter Award results are now published — View the official Award Winners";
