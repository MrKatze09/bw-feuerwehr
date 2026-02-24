// Netlify Function: Discord Mitglieder abrufen
exports.handler = async (event) => {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  // CORS Header damit der Browser die Antwort akzeptiert
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Schritt 1: Alle Mitglieder abrufen
    const membersRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`,
      { headers: { "Authorization": `Bot ${token}` } }
    );
    const members = await membersRes.json();

    // Schritt 2: Rollen-Namen abrufen
    const rolesRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/roles`,
      { headers: { "Authorization": `Bot ${token}` } }
    );
    const roles = await rolesRes.json();
    const roleMap = {};
    roles.forEach(r => roleMap[r.id] = r.name);

    // Schritt 3: Daten für das Führungssystem aufbereiten
    const result = members
      .filter(m => !m.user.bot) // Bots ausfiltern
      .map(m => ({
        id: m.user.id,
        name: m.user.username,
        nick: m.nick || m.user.username,
        roles: m.roles.map(rid => roleMap[rid]).filter(Boolean),
        avatar: m.user.avatar
          ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
          : null
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
