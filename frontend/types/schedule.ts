export type DayOfWeek =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7;

export type Schedule = {
  _id: string;
  professional: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  active: boolean;
};