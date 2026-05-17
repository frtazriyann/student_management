const analyzePerformance = (results) => {
  if (!results || results.length === 0) {
    return { weakSubjects: [], suggestions: [], trend: 'insufficient_data' };
  }

  const subjectPerformance = {};
  results.forEach((result) => {
    const subjectName = result.exam?.subject?.name || 'Unknown';
    if (!subjectPerformance[subjectName]) {
      subjectPerformance[subjectName] = [];
    }
    const percentage = result.exam?.totalMarks
      ? (result.marksObtained / result.exam.totalMarks) * 100
      : 0;
    subjectPerformance[subjectName].push({
      percentage,
      date: result.exam?.date,
      marksObtained: result.marksObtained,
      totalMarks: result.exam?.totalMarks,
    });
  });

  const subjectAverages = {};
  Object.entries(subjectPerformance).forEach(([subject, scores]) => {
    const avg = scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length;
    subjectAverages[subject] = Math.round(avg * 100) / 100;
  });

  const weakSubjects = Object.entries(subjectAverages)
    .filter(([, avg]) => avg < 50)
    .sort((a, b) => a[1] - b[1])
    .map(([name, avg]) => ({ name, average: avg }));

  const suggestions = [];
  weakSubjects.forEach((s) => {
    suggestions.push(`Focus more on ${s.name} (current average: ${s.average}%)`);
  });

  const allScores = results.map((r) =>
    r.exam?.totalMarks ? (r.marksObtained / r.exam.totalMarks) * 100 : 0
  );
  let trend = 'stable';
  if (allScores.length >= 2) {
    const half = Math.floor(allScores.length / 2);
    const firstHalf = allScores.slice(0, half);
    const secondHalf = allScores.slice(half);
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (avgSecond > avgFirst + 5) trend = 'improving';
    else if (avgSecond < avgFirst - 5) trend = 'declining';
  }

  const overallAvg = allScores.length
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100) / 100
    : 0;

  let predictedPerformance = 'average';
  if (overallAvg >= 80) predictedPerformance = 'excellent';
  else if (overallAvg >= 60) predictedPerformance = 'good';
  else if (overallAvg < 40) predictedPerformance = 'needs_improvement';

  return {
    subjectAverages,
    weakSubjects,
    suggestions,
    trend,
    overallAverage: overallAvg,
    predictedPerformance,
    subjectPerformance,
  };
};

module.exports = { analyzePerformance };
