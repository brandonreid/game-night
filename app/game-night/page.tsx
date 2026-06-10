import { getGameNightInfo, getPlayers, getBrianPlayers, getBrianGameNightInfo } from "@/app/actions"
import GameNightClient from "@/components/game-night-client"

export default async function GameNight() {
  // Fetch both regular and Brian's board data in parallel
  const [players, gameNightInfo, brianPlayers, brianGameNightInfo] = await Promise.all([
    getPlayers(),
    getGameNightInfo(),
    getBrianPlayers(),
    getBrianGameNightInfo(),
  ])

  return (
    <GameNightClient
      players={players}
      gameNightInfo={gameNightInfo}
      brianPlayers={brianPlayers}
      brianGameNightInfo={brianGameNightInfo}
    />
  )
}
