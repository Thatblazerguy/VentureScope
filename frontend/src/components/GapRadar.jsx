import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';

const AXIS_DESCRIPTIONS = {
  'Opportunity': 'Overall whitespace gap between research and market.',
  'Research': 'Academic momentum and volume of scientific papers.',
  'Product': 'Existing market saturation and active product repositories.',
  'Velocity': 'Speed of emergence based on research acceleration.',
  'Readiness': 'Commercial viability based on current market activity.'
};

function extractMetrics(opp) {
  const score = Number(opp.score ?? 50);
  const researchMatch = opp.summary?.match(/Research signals?:\s*(\d+)/i);
  const productMatch  = opp.summary?.match(/Product signals?:\s*(\d+)/i);
  const rCount = researchMatch ? Number(researchMatch[1]) : 0;
  const pCount = productMatch  ? Number(productMatch[1])  : 0;

  // Derive fixed 5 axes to ensure the radar is always a beautiful pentagon
  const researchVelocity = Math.min(100, Math.max(10, rCount * 15 + 20));
  const productActivity = Math.min(100, Math.max(10, pCount * 20 + 15));
  const velocity = Math.min(100, score * 0.5 + researchVelocity * 0.5);
  const readiness = Math.min(100, score * 0.4 + productActivity * 0.6);

  return [
    { axis: 'Opportunity', value: score },
    { axis: 'Research', value: researchVelocity },
    { axis: 'Product', value: productActivity },
    { axis: 'Velocity', value: velocity },
    { axis: 'Readiness', value: readiness }
  ];
}

export function GapRadar({ opportunities = [], riskAppetite = 'medium' }) {
  const [hoveredData, setHoveredData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  
  const [isAnimating, setIsAnimating] = useState(true);

  const radarData = useMemo(() => {
    if (!opportunities || opportunities.length === 0) {
      return [{
        domain: 'No data',
        metrics: [
          { axis: 'Opportunity', value: 0 },
          { axis: 'Research', value: 0 },
          { axis: 'Product', value: 0 },
          { axis: 'Velocity', value: 0 },
          { axis: 'Readiness', value: 0 }
        ]
      }];
    }
    // Plot up to top 3 domains
    return opportunities.slice(0, 3).map((opp, i) => ({
      domain: opp.domain || opp.title || opp.name || `Signal ${i+1}`,
      metrics: extractMetrics(opp),
      summary: opp.summary,
      score: opp.score
    }));
  }, [opportunities]);

  useEffect(() => {
    setIsAnimating(true);
    const t = setTimeout(() => setIsAnimating(false), 50);
    return () => clearTimeout(t);
  }, [radarData]);

  const width = 560;
  const height = 420;
  const radius = Math.min(width, height) / 2 - 60;
  const centerX = width / 2;
  const centerY = height / 2 + 10;
  
  const axesLabels = ['Opportunity', 'Research', 'Product', 'Velocity', 'Readiness'];
  const angleStep = (Math.PI * 2) / axesLabels.length;
  const maxScore = 100;

  const line = d3.lineRadial()
    .radius(d => (d.value / maxScore) * radius)
    .angle((_, i) => i * angleStep)
    .curve(d3.curveLinearClosed);

  return (
    <div className="relative rounded-[24px] p-6" style={{ position: "relative", background: "#5a3d28", border: "1px solid rgba(220,203,190,0.12)", boxShadow: "0 8px 32px rgba(42,20,8,0.25)" }}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "700", color: "#DCCBBE", marginBottom: "4px" }}>Market Landscape</h2>
          <p style={{ fontSize: "13px", color: "rgba(220,203,190,0.6)" }}>
            Multi-dimensional analysis for top domains.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {radarData.map((dItem, idx) => {
                if (dItem.domain === 'No data') return null;
                const color = idx === 0 ? "#DCCBBE" : idx === 1 ? "#c8a87a" : "#a8856a";
                return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', background: color, borderRadius: '50%', border: `1px solid ${color}` }}></span>
                        <span style={{ fontSize: '11px', color: 'rgba(220,203,190,0.55)', fontFamily: 'var(--font-mono)' }}>{dItem.domain.toUpperCase()}</span>
                    </div>
                )
            })}
        </div>
      </div>

      <div className="relative" style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <radialGradient id="radarRingGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(220,203,190,0.15)" />
              <stop offset="100%" stopColor="rgba(220,203,190,0.02)" />
            </radialGradient>

            <radialGradient id="fill-0" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(220,203,190,0.22)" />
              <stop offset="100%" stopColor="rgba(220,203,190,0.04)" />
            </radialGradient>
            <radialGradient id="fill-1" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(200, 170, 120, 0.20)" />
              <stop offset="100%" stopColor="rgba(200, 170, 120, 0.04)" />
            </radialGradient>
            <radialGradient id="fill-2" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(168, 133, 106, 0.20)" />
              <stop offset="100%" stopColor="rgba(168, 133, 106, 0.04)" />
            </radialGradient>

            <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${centerX}, ${centerY})`}>
            {/* Concentric rings */}
            {[0.25, 0.5, 0.75, 1].map((fraction, i) => (
              <circle
                key={`ring-${fraction}`}
                r={radius * fraction}
                  fill="none"
                  stroke="rgba(117, 86, 63, 0.12)"
                  strokeWidth={0.75}
                style={{
                  opacity: isAnimating ? 0 : 1,
                  transition: `opacity 600ms ease ${i * 100}ms`
                }}
              />
            ))}

            {radarData[0].domain === 'No data' ? (
              <text fill="var(--tw-colors-mist, #7a93b0)" fontSize="14" textAnchor="middle">
                No discovery data yet
              </text>
            ) : (
              <>
                {/* Axes and labels */}
                {axesLabels.map((axis, i) => {
                  const angle = i * angleStep - Math.PI / 2;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  const labelRadius = radius + 35;
                  const labelX = Math.cos(angle) * labelRadius;
                  const labelY = Math.sin(angle) * labelRadius;
                  const labelWidth = axis.length * 8 + 16;

                  return (
                    <g key={`axis-${i}`}>
                      <line x1={0} y1={0} x2={x} y2={y} stroke="rgba(220, 203, 190, 0.12)" strokeWidth={0.5} />
                      <g transform={`translate(${labelX}, ${labelY})`}>
                        <rect x={-(labelWidth / 2)} y={-12} width={labelWidth} height={24} fill="rgba(60,35,18,0.85)" rx={4} />
                        <text
                          fill="#DCCBBE"
                          fontFamily="var(--font-display)"
                          fontSize="13px"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                        >  {axis}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Radar paths */}
                {/* We reverse so the top domain (index 0) renders last and sits on top */}
                {[...radarData].reverse().map((dItem) => {
                  const reverseIdx = radarData.indexOf(dItem);
                  const color = reverseIdx === 0 ? "var(--amber)" : reverseIdx === 1 ? "#7a93b0" : "#a86a42";
                  const fill = `url(#fill-${reverseIdx})`;
                  const pathString = line(dItem.metrics);
                  
                  // Calculate raw length approx for animation or just use opacity
                  // We'll use opacity for smoother multi-polygon transitions
                  
                  return (
                    <g key={`path-${reverseIdx}`}>
                      <path
                        d={pathString}
                        stroke={color}
                        strokeWidth={1.5}
                        strokeOpacity={0.9}
                        style={{
                          fill: fill,
                          opacity: isAnimating ? 0 : 1,
                          transform: isAnimating ? "scale(0.8)" : "scale(1)",
                          transformOrigin: "center",
                          transition: "opacity 600ms ease, transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}
                      />
                      
                      {/* Data dots */}
                      {dItem.metrics.map((m, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        const cx = Math.cos(angle) * ((m.value / maxScore) * radius);
                        const cy = Math.sin(angle) * ((m.value / maxScore) * radius);
                        return (
                          <g
                            key={`dot-${reverseIdx}-${i}`}
                            transform={`translate(${cx}, ${cy})`}
                            onMouseEnter={() => {
                                setHoveredData({ domain: dItem.domain, metric: m.axis, value: m.value, color, summary: dItem.summary });
                                setTooltipPos({ x: cx + centerX, y: cy + centerY });
                            }}
                            onMouseLeave={() => {
                                setHoveredData(null);
                                setTooltipPos(null);
                            }}
                            style={{ cursor: "pointer", opacity: isAnimating ? 0 : 1, transition: "opacity 300ms ease 400ms" }}
                          >
                            <circle r={8} fill="rgba(60,35,18,0.9)" />
                            <circle r={5.5} fill={color} filter="url(#dotGlow)" />
                          </g>
                        )
                      })}
                    </g>
                  );
                })}
              </>
            )}
          </g>
        </svg>

        {/* Floating Tooltip */}
        {hoveredData && tooltipPos && (
          <div
            className="vs-tooltip animate-fade-up"
            style={{
              position: "absolute",
              left: tooltipPos.x + 16,
              top: tooltipPos.y - 8,
              zIndex: 200,
              pointerEvents: "none",
              background: "rgba(220, 203, 190, 0.95)",
              border: `1px solid ${hoveredData.color}`,
              backdropFilter: "blur(8px)",
              padding: "16px",
              borderRadius: "8px",
              width: "240px",
              boxShadow: "0 8px 32px rgba(117, 86, 63, 0.2)"
            }}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: hoveredData.color, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
              {hoveredData.domain}
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "var(--cream)", marginBottom: "12px" }}>
              {hoveredData.metric}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fog)" }}>Score</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: hoveredData.color, fontWeight: "500" }}>
                {Math.round(hoveredData.value)}/100
              </span>
            </div>
            <div className="vs-progress-bar" style={{ height: "4px", background: "rgba(220, 203, 190, 0.12)", borderRadius: "2px", overflow: "hidden", marginBottom: "8px" }}>
              <div
                className="vs-progress-bar-fill"
                style={{ width: `${hoveredData.value}%`, height: "100%", background: hoveredData.color, borderRadius: "2px" }}
              />
            </div>

            <p style={{ fontSize: "11px", color: "rgba(60,35,18,0.7)", fontStyle: "italic", marginBottom: "8px", lineHeight: "1.4" }}>
              {AXIS_DESCRIPTIONS[hoveredData.metric]}
            </p>

            <p style={{ fontSize: "11px", color: "rgba(60,35,18,0.6)", lineHeight: "1.5", borderTop: "1px solid rgba(60,35,18,0.1)", paddingTop: "8px" }}>
              {hoveredData.summary}
            </p>
          </div>
        )}
      </div>

      {/* Score Card Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "14px",
          marginTop: "28px",
        }}
      >
        {opportunities.map((opp, i) => {
          const score = Number(opp.score ?? 50);
          const scoreClass = score >= 75 ? "score-high" : score >= 45 ? "score-mid" : "score-low";

          let oppRiskLevel = "low";
          if (score >= 70) oppRiskLevel = "high";
          else if (score >= 40) oppRiskLevel = "medium";

          const isRiskMatch = riskAppetite.toLowerCase() === oppRiskLevel;

          const researchMatch = opp.summary?.match(/Research signals?:\s*(\d+)/i);
          const productMatch  = opp.summary?.match(/Product signals?:\s*(\d+)/i);
          const researchCount = researchMatch ? researchMatch[1] : null;
          const productCount  = productMatch  ? productMatch[1]  : null;

          const domain = opp.domain || opp.title || opp.name || `Signal ${i + 1}`;

          return (
            <div
              key={domain || i}
              style={{
                background: "rgba(40, 22, 10, 0.6)",
                border: isRiskMatch ? "1px solid var(--amber)" : "1px solid rgba(220, 203, 190, 0.10)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 20px",
                position: "relative",
                overflow: "hidden",
                borderLeft: score >= 75 ? "4px solid #DCCBBE" : score >= 45 ? "4px solid rgba(220,203,190,0.5)" : "4px solid rgba(220,203,190,0.2)",
              }}
              className={`animate-fade-up animate-fade-up-d${Math.min(i + 1, 5)}`}
            >
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "#DCCBBE", marginBottom: "6px", paddingLeft: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{domain}</span>
                {isRiskMatch && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", background: "var(--amber)", color: "var(--panel)", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
                    ★ Risk Match
                  </span>
                )}
              </h4>

              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", paddingLeft: "10px", marginBottom: "12px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "44px", fontWeight: "500", color: "#DCCBBE", lineHeight: 1 }}>{score}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "rgba(220,203,190,0.5)", fontWeight: "400" }}>/100</span>
              </div>

              <div style={{ marginLeft: "10px", marginBottom: "14px", height: "6px", background: "rgba(220,203,190,0.12)", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{ width: `${score}%`, height: "100%", background: "linear-gradient(90deg, rgba(220,203,190,0.5), #DCCBBE)", borderRadius: "9999px", transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
              </div>

              {(researchCount || productCount) && (
                <div style={{ display: "flex", gap: "8px", paddingLeft: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
                  {researchCount && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", padding: "3px 8px", borderRadius: "var(--radius-pill)", background: "rgba(220, 203, 190, 0.10)", color: "#DCCBBE", border: "1px solid rgba(220, 203, 190, 0.2)" }}>
                      📄 {researchCount} research
                    </span>
                  )}
                  {productCount && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", padding: "3px 8px", borderRadius: "var(--radius-pill)", background: "rgba(92, 158, 110, 0.12)", color: "#7ec99a", border: "1px solid rgba(92, 158, 110, 0.25)" }}>
                      ⚡ {productCount} product
                    </span>
                  )}
                </div>
              )}

              <p style={{ fontSize: "12px", color: "rgba(220,203,190,0.55)", paddingLeft: "10px", lineHeight: "1.55", marginBottom: "14px" }}>
                {opp.summary}
              </p>

              <div style={{ paddingLeft: "10px", display: "flex", justifyContent: "flex-end" }}>
                <button style={{ fontSize: "12px", padding: "5px 12px", opacity: 0.5, cursor: "default", background: "transparent", border: "1px solid rgba(220,203,190,0.2)", borderRadius: "var(--radius-md)", color: "rgba(220,203,190,0.6)", fontFamily: "var(--font-body)" }} disabled>
                  ▸ Explore
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}