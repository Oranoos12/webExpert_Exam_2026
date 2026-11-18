// Een score is geldig als het een geheel getal is van 0 of meer.
// "2" (tekst), -1, 1.5, null en undefined zijn NIET geldig.
function isValidScore(score) {
    if (typeof score !== 'number') {
        return false;
    }
    if (!Number.isInteger(score)) {
        return false;
    }
    if (score < 0) {
        return false;
    }
    return true;
}

// Wie wint er? 'home', 'away' of 'draw' (gelijkspel)
function getOutcome(homeScore, awayScore) {
    if (homeScore > awayScore) {
        return 'home';
    }
    if (homeScore < awayScore) {
        return 'away';
    }
    return 'draw';
}

// Scoring-algoritme uit de opdracht:
// juiste winnaar of gelijkspel: +1
// exacte uitslag: +2 (extra)  -> exacte uitslag = 3 punten in totaal
function calculatePoints(predictedHome, predictedAway, realHome, realAway) {
    let points = 0;
    if (getOutcome(predictedHome, predictedAway) === getOutcome(realHome, realAway)) {
        points = points + 1;
    }
    if (predictedHome === realHome && predictedAway === realAway) {
        points = points + 2;
    }
    return points;
}

module.exports = { isValidScore, getOutcome, calculatePoints };