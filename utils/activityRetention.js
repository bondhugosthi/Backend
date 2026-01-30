const parseRetentionDays = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

const ACTIVITY_RETENTION_DAYS = parseRetentionDays(process.env.ACTIVITY_RETENTION_DAYS, 7);
const ACTIVITY_RETENTION_SECONDS = ACTIVITY_RETENTION_DAYS * 24 * 60 * 60;

const getRetentionDate = () => new Date(Date.now() - ACTIVITY_RETENTION_SECONDS * 1000);

module.exports = {
  ACTIVITY_RETENTION_DAYS,
  ACTIVITY_RETENTION_SECONDS,
  getRetentionDate
};
