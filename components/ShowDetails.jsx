import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../src/index.css";
import { MenuItem, Toolbar, Stack, Typography, Select } from "@mui/material";
import { MDBBtn } from "mdb-react-ui-kit";
import supabase from "../supabase";

const genreList = [
  "Personal Growth",
  "True Crime and Investigative Journalism",
  "History",
  "Comedy",
  "Entertainment",
  "Business",
  "Fiction",
  "News",
  "Kids and Family",
];

const mapGenres = (genreNumbers) => {
  return genreNumbers.map((number) => {
    if (number >= 0 && number < genreList.length) {
      return genreList[number];
    }
    return "Unknown Genre";
  });
};

const ShowDetails = (props) => {
  const { showId } = useParams();
  const { showData, currentShow } = props;

  const result = showData.find((item) => item.id === showId);

  if (!result) {
    return <div>Loading data via Slowpoke...</div>;
  }

  const { description, id, image, seasons, title, updated } = result;

  const genreObject = currentShow.find((item) => item.id === showId);

  if (!genreObject) {
    return <div>Loading data via Slowpoke...</div>;
  }

  const { genres } = genreObject;

  const mappedGenres = mapGenres(genres);

  const handleSeasonSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedSeason(selectedValue);
  };

  const allEpisodes = seasons.flatMap((season) => season.episodes);

  const [selectedSeason, setSelectedSeason] = useState(null);
  const [favoriteEpisodes, setFavoriteEpisodes] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [episodeProgress, setEpisodeProgress] = useState({});

  const fetchFavoriteEpisodes = async () => {
    const user = await supabase.auth.getUser();
    if (user) {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id)
          .eq("show_id", showId);

        if (error) {
          console.error("Error fetching favorite episodes:", error.message);
        } else {
          const favoriteEpisodesData = data.map((episode) => ({
            showId: episode.show_id,
            seasonNumber: episode.season_number - 1,
            episodeNumber: episode.episode_number - 1,
            dateAdded: new Date(episode.time_added),
          }));
          setFavoriteEpisodes(favoriteEpisodesData);
        }
      } catch (error) {
        console.error("Error fetching favorite episodes:", error.message);
      }
    }
  };

  useEffect(() => {
    async function getUserAndLog() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
        } else {
          setCurrentUser(data.user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    getUserAndLog();
    fetchFavoriteEpisodes();

    const savedProgress = localStorage.getItem("episodeProgress");
    if (savedProgress) {
      setEpisodeProgress(JSON.parse(savedProgress));
    }
  }, []);

  const handleFavoriteEpisode = async (seasonNumber, episodeNumber) => {
    const isFavorite = favoriteEpisodes.some(
      (episode) =>
        episode.seasonNumber === seasonNumber &&
        episode.episodeNumber === episodeNumber
    );

    if (isFavorite) {
      const updatedFavorites = favoriteEpisodes.filter(
        (episode) =>
          episode.seasonNumber !== seasonNumber ||
          episode.episodeNumber !== episodeNumber
      );
      setFavoriteEpisodes(updatedFavorites);

      await removeFavoriteEpisode(showId, seasonNumber, episodeNumber);
    } else {
      const newFavorite = {
        showId: showId,
        seasonNumber: seasonNumber,
        episodeNumber: episodeNumber,
      };
      setFavoriteEpisodes([...favoriteEpisodes, newFavorite]);

      saveFavoriteEpisodes([...favoriteEpisodes, newFavorite]);
    }

    if (!isFavorite) {
      const episodeKey = `${showId}_${seasonNumber}_${episodeNumber}`;
      const audioElement = document.getElementById(episodeKey);
      if (audioElement && audioElement.currentTime > 0) {
        const progress = audioElement.currentTime;
        setEpisodeProgress({
          ...episodeProgress,
          [episodeKey]: progress,
        });
        localStorage.setItem(
          "episodeProgress",
          JSON.stringify(episodeProgress)
        );
      }
    }
  };

  const removeFavoriteEpisode = async (showId, seasonNumber, episodeNumber) => {
    try {
      const user = supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to remove favorite episodes.");
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", (await supabase.auth.getUser()).data.user.id)
        .eq("show_id", showId)
        .eq("season_number", seasonNumber + 1)
        .eq("episode_number", episodeNumber + 1);

      if (error) {
        console.error("Error removing favorite episode:", error.message);
      } else {
        console.log("Favorite episode removed successfully!");
      }
    } catch (error) {
      console.error("Error removing favorite episode:", error.message);
    }
  };

  const saveFavoriteEpisodes = async (episodes) => {
    const user = supabase.auth.getUser();
    if (!user) {
      alert("Please sign in to save favorite episodes.");
      return;
    }

    try {
      const { data, error } = await supabase.from("favorites").insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        show_id: episodes[episodes.length - 1].showId,
        season_number: episodes[episodes.length - 1].seasonNumber + 1,
        episode_number: episodes[episodes.length - 1].episodeNumber + 1,
        time_added: new Date(),
      });
      if (error) {
        console.error("Error saving favorite episodes:", error.message);
      } else {
        console.log("Favorite episodes saved successfully!");
      }
    } catch (error) {
      console.error("Error saving favorite episodes:", error.message);
    }
  };

  const handleTabClose = (event) => {
    if (isAudioPlaying) {
      event.preventDefault();
      event.returnValue = "Audio will stop playing";
      setShowConfirmationModal(true);
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleTabClose);
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [isAudioPlaying]);

  const handleConfirmation = () => {
    setShowConfirmationModal(false);
    window.close();
  };

  const handleCancel = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="show-details-container">
      <img src={image} alt={title} className="show-image" />
      <h1 className="show-title">{title}</h1>
      <p className="show-description">{description}</p>
      <p className="show-genres">Genres: {mappedGenres.join(", ")}</p>
      <p className="show-seasons">Seasons: {seasons.length}</p>

      <Toolbar>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle1" color="inherit">
            Season:
          </Typography>
          <Select
            value={selectedSeason === null ? "none" : selectedSeason}
            onChange={handleSeasonSelectChange}
            variant="outlined"
          >
            <MenuItem value="none">Select Season</MenuItem>
            <MenuItem value="all">All</MenuItem>
            {seasons.map((season, index) => (
              <MenuItem key={index} value={index}>
                Season {index + 1}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Toolbar>

      {seasons[selectedSeason] &&
        selectedSeason !== "none" &&
        selectedSeason !== "all" && (
          <div className="selected-season-details">
            <h2>Selected Season Details</h2>
            <p className="selected-season">
              Season: {seasons[selectedSeason].season}
            </p>
            <p className="selected-title">
              Title: {seasons[selectedSeason].title}
            </p>
            <p className="selected-episodes">
              Number of Episodes: {seasons[selectedSeason].episodes.length}
            </p>
            <ul>
              {seasons[selectedSeason].episodes.map((episode, index) => {
                const episodeKey = `${showId}_${selectedSeason}_${index}`;
                const progress = episodeProgress[episodeKey] || 0;
                return (
                  <li key={index}>
                    <p className="episode">Episode: {episode.episode}</p>
                    <p className="episode-title">Title: {episode.title}</p>
                    <p className="episode-description">
                      Description: {episode.description}
                    </p>
                    <audio
                      controls
                      onPlay={() => setIsAudioPlaying(true)}
                      onPause={() => setIsAudioPlaying(false)}
                      id={episodeKey}
                      onTimeUpdate={(e) => {
                        const currentTime = e.target.currentTime;
                        setEpisodeProgress({
                          ...episodeProgress,
                          [episodeKey]: currentTime,
                        });
                        localStorage.setItem(
                          "episodeProgress",
                          JSON.stringify(episodeProgress)
                        );
                      }}
                    >
                      <source src={episode.file} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <MDBBtn
                      onClick={() =>
                        handleFavoriteEpisode(selectedSeason, index)
                      }
                    >
                      {favoriteEpisodes.some(
                        (favEpisode) =>
                          favEpisode.seasonNumber === selectedSeason &&
                          favEpisode.episodeNumber === index
                      )
                        ? "Unfavorite"
                        : "Favorite"}
                    </MDBBtn>
                  </li>
                );
              })}
            </ul>
            <MDBBtn onClick={() => saveFavoriteEpisodes(favoriteEpisodes)}>
              Save Favorite Episodes
            </MDBBtn>
          </div>
        )}

      {selectedSeason === "all" && (
        <div className="selected-season-details">
          <h2>All Episodes of All Seasons</h2>
          {seasons.map((season, seasonIndex) => (
            <div key={seasonIndex}>
              <h3>Season {seasonIndex + 1}</h3>
              <ul>
                {season.episodes.map((episode, episodeIndex) => {
                  const episodeKey = `${showId}_${seasonIndex}_${episodeIndex}`;
                  const progress = episodeProgress[episodeKey] || 0;
                  return (
                    <li key={episodeIndex}>
                      <p className="episode">Episode: {episode.episode}</p>
                      <p className="episode-title">Title: {episode.title}</p>
                      <p className="episode-description">
                        Description: {episode.description}
                      </p>
                      <audio
                        controls
                        onPlay={() => setIsAudioPlaying(true)}
                        onPause={() => setIsAudioPlaying(false)}
                        id={episodeKey}
                        onTimeUpdate={(e) => {
                          const currentTime = e.target.currentTime;
                          setEpisodeProgress({
                            ...episodeProgress,
                            [episodeKey]: currentTime,
                          });
                          localStorage.setItem(
                            "episodeProgress",
                            JSON.stringify(episodeProgress)
                          );
                        }}
                      >
                        <source src={episode.file} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      <MDBBtn
                        onClick={() =>
                          handleFavoriteEpisode(seasonIndex, episodeIndex)
                        }
                      >
                        {favoriteEpisodes.some(
                          (favEpisode) =>
                            favEpisode.seasonNumber === seasonIndex &&
                            favEpisode.episodeNumber === episodeIndex
                        )
                          ? "Unfavorite"
                          : "Favorite"}
                      </MDBBtn>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <MDBBtn onClick={() => saveFavoriteEpisodes(favoriteEpisodes)}>
            Save Favorite Episodes
          </MDBBtn>
        </div>
      )}

      {showConfirmationModal && (
        <div className="confirmation-modal">
          <h3>Confirm Leaving</h3>
          <p>
            Are you sure you want to leave? Audio is still playing. Click
            "Leave" to close the page or "Cancel" to stay on the page.
          </p>
          <div>
            <button onClick={handleConfirmation}>Leave</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowDetails;
