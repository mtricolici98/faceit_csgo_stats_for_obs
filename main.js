const URL_playerData = "https://open.faceit.com/data/v4/players/"; //Followed by PID
const URL_players_by_nickname = "https://open.faceit.com/data/v4/players?nickname="; //Followed by PID
let API_KEY;
let player_id;
let nickname;
let player_data;

$(document).ready(() => {
        console.log("Script loaded");
        setVarsFromQuery();
        if (!nickname) {
            $('.card-body').text(
                "Missing Nickname, cant continue. Please consult the instructions."
            );
            return;
        }
        if (!API_KEY) {
            $('.card-body').text(
                "Missing API_KEY, cant continue. Please consult the instructions."
            );
            return;
        }
        getPlayerIDByName(nickname).then(
            () => {
                setCSGOData();
                setPlayerDailyWR();
                setInterval(() => {
                    setCSGOData();
                    setPlayerDailyWR();
                }, 30000);
            }
        );
        if (0) {
            fcapi_http_get(URL_playerData + player_id).then((data) => {
                console.log("Success API Call");
                console.log(data);
            }).catch((data) => {
                    console.log("API call failed");
                    console.log(data);
                }
            );
        }
    }
);

function setVarsFromQuery() {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("nickname")) {
        nickname = urlParams.get("nickname");
    }
    if (urlParams.has("api_key")) {
        API_KEY = urlParams.get("api_key");
    }
}


function setCSGOData() {
    if (player_data.games.hasOwnProperty("csgo")) {
        let csgoinfo = player_data.games.csgo;
        let skill_lvl = csgoinfo.skill_level;
        let faceit_elo = csgoinfo.faceit_elo;
        let lvl_selector = $('#faceitlvl');
        lvl_selector.text(skill_lvl);
        let eloselector = $('#faceitelo');
        eloselector.text(faceit_elo);
        if (skill_lvl === 1) {
            lvl_selector.css("color", "snow");
        } else if (skill_lvl < 4 && skill_lvl > 1) {
            lvl_selector.css("color", "limegreen")
        } else if (skill_lvl > 3 && skill_lvl < 8) {
            lvl_selector.css("color", "yellow")
        } else if (skill_lvl > 7 && skill_lvl < 10) {
            lvl_selector.css("color", "orange")
        } else if (skill_lvl === 10) {
            lvl_selector.css("color", "red")
        }
    }
}

function setPlayerDailyWR() {
    let games_won = 0;
    let games_total = 0;
    getPlayerCSGOGamesHistory().then(
        (response) => {
            let matches_played = response.items;
            games_total = matches_played.length;

            function getPlayerFaction(match) {
                if (match.teams.faction1.players.find((player) => {
                    return player.player_id === player_id
                })) {
                    return "faction1";
                } else {
                    return "faction2";
                }
            }

            for (let match of matches_played) {
                if (match.results.winner === getPlayerFaction(match)) {
                    games_won++;
                }
            }
            let win_selector = $("#wontoday");
            let total_selector = $("#totaltoday");
            win_selector.text(games_won);
            total_selector.text(games_total);
            if (games_won === games_total && games_total !== 0) {
                win_selector.css("color", "limegreen");
            } else if (games_won > (games_total / 2) && games_won < games_total) {
                win_selector.css("color", "yellow");
            } else if (games_won < games_total / 2) {
                win_selector.css("color", "orange");
            } else if (games_won === 0 && games_total !== 0) {
                win_selector.css("color", "red");
            }
        }
    );
}

function getPlayerIDByName(name) {
    return new Promise(resolve => {
        fcapi_http_get(URL_players_by_nickname + `${name}`).then(
            (response) => {
                let p_data = response;
                console.log("Discovered the player ID: " + p_data.player_id);
                player_data = p_data;
                player_id = p_data.player_id;
                resolve();
            }
        )
    });
}

function getPlayerCSGOGamesHistory() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let timestamp = today.getTime() / 1000;
    return new Promise(resolve => {
        fcapi_http_get(URL_playerData + `${player_id}/history?game=csgo&from=${timestamp}`).then(
            (response) => {
                resolve(response);
            }
        )
    });
}

function fcapi_http_get(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
            }
        }).done((data) => resolve(data)).fail((data) => reject(data));
    });
}
