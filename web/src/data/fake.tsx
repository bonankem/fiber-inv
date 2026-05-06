const fakeSurvey = (n: number) => ({
  sid: `FHS-20260429-${(n + 1).toString().padStart(4, "0")}`,
  name: "Yamoussoukro City Centre",
  status: "Requested",
  pendingOn: "Huawei",
  engineer: "John Doe",
  vendor: "Huawei",
  city: "Yamoussoukro",
  requestDate: "25 Mar 2026",
  assigned: "Huawei",
});

export const fakeSurveys = Array.from({ length: 200 }, (_, n) =>
  fakeSurvey(n),
).reverse();
