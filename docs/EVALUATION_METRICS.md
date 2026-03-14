# Evaluation Metrics

## Why Metrics Matter

The assignment evaluates practical thinking, architecture clarity, and responsible AI alignment. This metric set makes the prototype measurable for evaluators and recruiters.

## Core Product KPIs

| KPI | Definition | Baseline | Target |
|---|---|---:|---:|
| Time to first usable query | Seconds from submit to copy-ready output | Manual process | < 8s |
| Query copy rate | Percentage of generated queries copied by user | Unknown | > 60% |
| Regeneration rate | Percentage of sessions requiring regeneration | Unknown | < 35% |
| Relevance rating | User self-rating for query usefulness (1 to 5) | Unknown | >= 4.0 |
| Platform coverage quality | Distinctiveness of six platform outputs | Low in generic prompts | High with platform-aware rules |

## Operational KPIs

| KPI | Definition | Target |
|---|---|---:|
| API success rate | Successful responses over total requests | > 99% |
| JSON parse failure rate | Invalid model response rate | < 1% |
| P95 latency | 95th percentile response time | < 3.5s |
| Cost efficiency | Average token or request cost per generation | Track and reduce monthly |

## Governance KPIs

| KPI | Definition | Target |
|---|---|---:|
| Audit coverage | Percent of requests with request id and metadata logs | 100% |
| Safety compliance | Percent outputs passing policy checks | 100% |
| PII minimization compliance | Requests that avoid unnecessary personal data | 100% |

## Suggested Demo Reporting Block

Use this 4-line block in the assignment or demo:

- Avg generation latency: X.Xs
- Query copy rate: XX%
- User relevance score: X.X or 5
- JSON validity rate: XX.X%
