import React from 'react'
import Link from 'next/link' // ⬅️ React-router-dom ki jagah Next.js ka Link import kiya

export default function GamesAndChartsZone() {
  const dailyGames = [
    { name: "MATKA GUESSING FORUM", path: "/guessing-forum" },
    { name: "CHATTING FORUM", path: "#" },
    { name: "WEEKLY JODI AND PANNA", path: "#" },
    { name: "KHATRI FAVOURITE PANNA", path: "/khatri-favourite-panna" },
    { name: "WINNER LIST", oath: "/winner-list" }
  ]

  const jodiCharts = [
    { name: "SRIDEVI JODI CHART", path: "/sridevi-jodi-chart" },
    { name: "TIME BAZAR JODI CHART", path: "/time-bazar-jodi-chart" },
    { name: "MILAN DAY JODI CHART", path: "/milan-day-jodi-chart" },
    { name: "RAJDHANI DAY JODI CHART", path: "/rajdhani-day-jodi-chart" },
    { name: "SUPREME DAY JODI CHART", path: "/supreme-day-jodi-chart" },
    { name: "KALYAN JODI CHART", path: "/kalyan-jodi-chart" },
    { name: "SRIDEVI NIGHT JODI CHART", path: "/sridevi-night-jodi-chart" },
    { name: "MILAN NIGHT JODI CHART", path: "/milan-night-jodi-chart" },
    { name: "KALYAN NIGHT JODI CHART", path: "/kalyan-night-jodi-chart" },
    { name: "RAJDHANI NIGHT JODI CHART", path: "/rajdhani-night-jodi-chart" },
    { name: "MAIN BAZAR JODI CHART", path: "/main-bazar-jodi-chart" }
  ]

  const pannaCharts = [
    { name: "SRIDEVI PANNA CHART", path: "/sridevi-panna-chart" },
    { name: "TIME BAZAR PANNA CHART", path: "/time-bazar-panna-chart" },
    { name: "MILAN DAY PANNA CHART", path: "milan-day-panna-chart" },
    { name: "RAJDHANI DAY PANNA CHART", path: "/rajdhani-day-panna-chart" },
    { name: "SUPREME DAY PANNA CHART", path: "/supreme-day-panna-chart" },
    { name: "KALYAN PANNA CHART", path: "/kalyan-panna-chart" },
    { name: "SRIDEVI PANNA JODI CHART", path: "/sridevi-night-panna-chart" },
    { name: "MILAN NIGHT PANNA CHART", path: "/milan-night-panna-chart" },
    { name: "KALYAN NIGHT PANNA CHART", path: "/kalyan-night-panna-chart" },
    { name: "RAJDHANI NIGHT PANNA CHART", path: "/rajdhani-night-panna-chart" },
    { name: "MAIN BAZAR PANNA CHART", path: "/main-bazar-panna-chart" }
  ]

  // Header Box Styling
  const headerStyle = {
    backgroundColor: '#e6e6e6',
    color: 'black',
    textAlign: 'left',
    border: '4px groove brown',
    marginTop: '4px',
    marginBottom: '4px',
    fontSize: '18px',
    fontWeight: 700,
    padding: '8px 2px 8px 12px'
  }

  // Chart Item Button Styling
  const chartButtonStyle = {
    backgroundColor: '#e9e9e9',
    color: '#780127',
    fontSize: '18px',
    borderRadius: '5px',
    fontWeight: 'bold',
    padding: '10px',
    textAlign: 'center',
    border: '2px solid #7a0025',
    marginTop: '5px',
    marginBottom: '5px',
    fontStyle: 'italic',
    fontFamily: 'Helvetica Neue'
  }

  const pannaButtonStyle = {
    marginTop: '7px',
    marginBottom: '7px',
    paddingTop: '7px',
    paddingBottom: '7px',
    border: '2px solid #00cc00',
    backgroundColor: '#fff',
    color: '#000',
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontSize: '18px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box'
  }

  return (
    <div className="w-full my-1 space-y-1">
      {/* 🔹 DAILY GAMES ZONE */}
      <div className="w-full">
        <div className="w-full box-border" style={headerStyle}>
          <span>➡️</span> DAILY GAMES ZONE
        </div>
        <div>
          {dailyGames.map((game, i) => (
            game.path !== "#" ? (
              <Link key={i} href={game.path} className="block w-full">
                <div
                  className="w-full box-border"
                  style={{
                    color: '#000000',
                    fontSize: '16px',
                    borderRadius: '3px',
                    fontWeight: 'bold',
                    padding: '10px',
                    textAlign: 'center',
                    border: '2px solid #e70042',
                    backgroundColor: '#fff5f8',
                    boxShadow: '0 0 10px #461300',
                    marginTop: '5px',
                    marginBottom: '5px',
                    fontStyle: 'italic',
                    fontFamily: 'Helvetica Neue'
                  }}
                >
                  ♦ ❖ {game.name} ❖ ♦
                </div>
              </Link>
            ) : (
              <div
                key={i}
                className="w-full box-border"
                style={{
                  color: '#000000',
                  fontSize: '16px',
                  borderRadius: '3px',
                  fontWeight: 'bold',
                  padding: '10px',
                  textAlign: 'center',
                  border: '2px solid #e70042',
                  backgroundColor: '#fff5f8',
                  boxShadow: '0 0 10px #461300',
                  marginTop: '5px',
                  marginBottom: '5px',
                  fontStyle: 'italic',
                  fontFamily: 'Helvetica Neue'
                }}
              >
                ♦ ❖ {game.name} ❖ ♦
              </div>
            )
          ))}
        </div>
      </div>

      {/* 🔹 JODI CHARTS ZONE */}
      <div className="w-full">
        <div className="w-full box-border" style={headerStyle}>
          <span>➡️</span> JODI CHARTS ZONE
        </div>
        <div className="w-full box-border">
          {jodiCharts.map((chart, i) => (
            chart.path !== "#" ? (
              <Link key={i} href={chart.path} className="block w-full">
                <div className="w-full box-border" style={chartButtonStyle}>
                  {chart.name}
                </div>
              </Link>
            ) : (
              <div key={i} className="w-full box-border" style={chartButtonStyle}>
                {chart.name}
              </div>
            )
          ))}
        </div>
      </div>

      {/* 🔹 PANNA CHARTS ZONE */}
      <div className="w-full">
        <div className="w-full box-border" style={headerStyle}>
          <span>➡️</span> PANNA CHARTS ZONE
        </div>
        <div className="w-full box-border">
          {pannaCharts.map((chart, i) => (
            chart.path !== "#" ? (
              <Link key={i} href={chart.path} className="block w-full">
                <div className="w-full box-border" style={pannaButtonStyle}>
                  {chart.name}
                </div>
              </Link>
            ) : (
              <div key={i} className="w-full box-border" style={pannaButtonStyle}>
                {chart.name}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
                                  }

