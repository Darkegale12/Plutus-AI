import { logger } from '../utils/logger.js';
export class OutputValidator {
    async validate(task, output, qualityThreshold, criteria) {
        logger.info(`Validating output for task ${task.id}`);
        const validationChecks = [];
        const completenessScore = this.checkCompleteness(task, output);
        validationChecks.push(completenessScore);
        const formatScore = this.checkFormat(output);
        validationChecks.push(formatScore);
        const qualityScore = this.checkQuality(output);
        validationChecks.push(qualityScore);
        if (criteria && criteria.length > 0) {
            const criteriaScore = this.checkCriteria(output, criteria);
            validationChecks.push(criteriaScore);
        }
        const overallScore = validationChecks.reduce((sum, score) => sum + score, 0) / validationChecks.length;
        const passed = overallScore >= qualityThreshold;
        const result = {
            passed,
            score: overallScore,
            feedback: this.generateFeedback(overallScore, qualityThreshold),
            issues: passed ? [] : this.identifyIssues(output, validationChecks),
            recommendations: passed ? [] : this.generateRecommendations(output, validationChecks),
        };
        logger.info(`Validation result for task ${task.id}: ${passed ? 'PASSED' : 'FAILED'} (score: ${overallScore.toFixed(2)})`);
        return result;
    }
    checkCompleteness(_task, output) {
        if (!output || typeof output !== 'object') {
            return 0.3;
        }
        const hasOutput = !!output.output;
        const hasMetadata = !!output.metadata;
        const hasStatus = !!output.status;
        const completenessScore = ((hasOutput ? 0.5 : 0) +
            (hasMetadata ? 0.3 : 0) +
            (hasStatus ? 0.2 : 0));
        return completenessScore;
    }
    checkFormat(output) {
        try {
            if (typeof output !== 'object') {
                return 0.5;
            }
            if (output.timestamp) {
                const date = new Date(output.timestamp);
                if (isNaN(date.getTime())) {
                    return 0.7;
                }
            }
            return 1.0;
        }
        catch (error) {
            return 0.3;
        }
    }
    checkQuality(output) {
        if (!output.output || !output.output.metadata) {
            return 0.6;
        }
        const qualityIndicators = output.output.metadata.quality_indicators;
        if (!qualityIndicators) {
            return 0.7;
        }
        const { completeness = 0.5, accuracy = 0.5 } = qualityIndicators;
        return (completeness + accuracy) / 2;
    }
    checkCriteria(output, criteria) {
        const outputString = JSON.stringify(output).toLowerCase();
        let matchedCriteria = 0;
        for (const criterion of criteria) {
            if (outputString.includes(criterion.toLowerCase())) {
                matchedCriteria++;
            }
        }
        return criteria.length > 0 ? matchedCriteria / criteria.length : 1.0;
    }
    generateFeedback(score, threshold) {
        const feedback = [];
        if (score >= threshold) {
            feedback.push('Output meets quality standards');
            if (score >= 0.95) {
                feedback.push('Excellent quality - exceeds expectations');
            }
        }
        else {
            feedback.push(`Output below quality threshold (${score.toFixed(2)} < ${threshold})`);
            if (score < 0.5) {
                feedback.push('Significant improvements needed');
            }
            else if (score < threshold) {
                feedback.push('Minor improvements needed to meet standards');
            }
        }
        return feedback;
    }
    identifyIssues(_output, validationChecks) {
        const issues = [];
        if (validationChecks[0] < 0.8) {
            issues.push('Output appears incomplete or missing required fields');
        }
        if (validationChecks[1] < 0.8) {
            issues.push('Output format does not meet standards');
        }
        if (validationChecks[2] < 0.8) {
            issues.push('Quality indicators below acceptable levels');
        }
        if (validationChecks[3] !== undefined && validationChecks[3] < 0.8) {
            issues.push('Custom validation criteria not fully met');
        }
        return issues;
    }
    generateRecommendations(_output, validationChecks) {
        const recommendations = [];
        if (validationChecks[0] < 0.8) {
            recommendations.push('Ensure all required fields are present in output');
        }
        if (validationChecks[1] < 0.8) {
            recommendations.push('Follow proper JSON format and include timestamps');
        }
        if (validationChecks[2] < 0.8) {
            recommendations.push('Improve quality indicators for completeness and accuracy');
        }
        if (validationChecks[3] !== undefined && validationChecks[3] < 0.8) {
            recommendations.push('Review and address specific validation criteria');
        }
        return recommendations;
    }
}
//# sourceMappingURL=OutputValidator.js.map