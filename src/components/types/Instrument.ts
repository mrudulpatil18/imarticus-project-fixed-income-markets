export interface Instrument {
  ticker: string;
  name: string;
  bid: number;
  ask: number;
  faceValue: number;
  couponRate: number;
  daysToMaturity: number;
  modifiedDuration: number;
  bondType: string;
  series: string;
  issueDate: string;       // ISO format date (e.g., "2023-01-01")
  maturityDate: string;    // ISO format date
  nextCouponDate: string;  // ISO format date
  creditRating: string;
}
