const eventsStep = 15;
const eventsStepsInHour = 60 / eventsStep;
const sheduleDaysMax = 10;

const startHour = 0;
const hoursInDay = 24;
const lastHour = startHour + hoursInDay;
const slotWidth = 100 / (hoursInDay * eventsStepsInHour); // %
const slotHourWidth = 100 / hoursInDay; // %

module.exports = {
  eventsStep: eventsStep,
  eventsStepsInHour: eventsStepsInHour,
  hoursInDay: hoursInDay,
  lastHour: lastHour,
  sheduleDaysMax: sheduleDaysMax,
  slotWidth: slotWidth,
  slotHourWidth: slotHourWidth,
  startHour: startHour
};
