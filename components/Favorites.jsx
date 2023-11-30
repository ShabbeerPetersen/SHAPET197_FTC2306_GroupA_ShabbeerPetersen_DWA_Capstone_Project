import React, { useState, useEffect } from "react";
import supabase from "../supabase";
import AppBar from "@mui/material/AppBar";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useParams } from "react-router-dom";
import LoadingCard from "./LoadingFav";

const Favorites = (props) => {
  const { userId } = useParams();
  const { showsData } = props;

  const [allPreviewData, setAllPreviewData] = useState([]);
  const [allShowData, setAllShowData] = useState([]);

  const [favoriteEpisodes, setFavoriteEpisodes] = useState([]);
  const [sortOption, setSortOption] = useState("All");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleAudioPlay = () => {
    setAudioPlaying(true);
  };

  const handleAudioPause = () => {
    setAudioPlaying(false);
  };

  const fetchFavoriteEpisodes = async () => {
    const user = supabase.auth.getUser();
    if (user) {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching favorite episodes:", error.message);
        } else {
          const favoriteEpisodesData = data.map(async (episode) => {
            const showId = episode.show_id;
            const seasonNumber = episode.season_number - 1;
            const episodeNumber = episode.episode_number - 1;
            const id = episode.id;
            const time = episode.time;

            const showTitle = getShowTitle(showId);
            const seasonTitle = getSeasonTitle(showId, seasonNumber);

            const show = showsData.find((item) => item.id === showId);
            const episodeData =
              show?.seasons[seasonNumber]?.episodes[episodeNumber];

            return {
              showId,
              seasonNumber,
              episodeNumber,
              id,
              time,
              showTitle,
              seasonTitle,
              episodeData,
            };
          });

          Promise.all(favoriteEpisodesData).then((data) => {
            setFavoriteEpisodes(data);
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error("Error fetching favorite episodes:", error.message);
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        if (!showsData) {
          const res = await fetch("https://podcast-api.netlify.app/shows");
          const previewData = await res.json();
          setAllPreviewData(previewData);
        }

        if (!showsData || !showsData.showData || !showsData.apiComplete) {
          const showIds = allPreviewData.map((item) => item.id);
          const showPromises = showIds.map((id) =>
            fetch(`https://podcast-api.netlify.app/id/${id}`).then((res) =>
              res.json()
            )
          );
          const showData = await Promise.all(showPromises);
          setAllShowData(showData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
    fetchFavoriteEpisodes();
  }, [showsData, userId]);

  const getShowTitle = (showId) => {
    const show = showsData.find((item) => item.id === showId);
    return show ? show.title : "Unknown Show";
  };

  const getSeasonTitle = (showId, seasonNumber) => {
    const show = showsData.find((item) => item.id === showId);
    return show && show.seasons[seasonNumber]
      ? show.seasons[seasonNumber].season
      : "Unknown Season";
  };

  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      setFavoriteEpisodes((prevFavorites) =>
        prevFavorites.filter((episode) => episode.id !== favoriteId)
      );

      await supabase.from("favorites").delete().eq("id", favoriteId);
      console.log("Favorite episode removed successfully!");
    } catch (error) {
      console.error("Error removing favorite episode:", error.message);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const sortEpisodes = (episodes, option) => {
    switch (option) {
      case "A-Z":
        return episodes.sort((a, b) => {
          const episodeA = a.episodeData;
          const episodeB = b.episodeData;
          return (
            episodeA?.title.localeCompare(episodeB?.title) ||
            a.showTitle.localeCompare(b.showTitle) ||
            a.seasonTitle.localeCompare(b.seasonTitle)
          );
        });
      case "Z-A":
        return episodes.sort((a, b) => {
          const episodeA = a.episodeData;
          const episodeB = b.episodeData;
          return (
            episodeB?.title.localeCompare(episodeA?.title) ||
            b.showTitle.localeCompare(a.showTitle) ||
            b.seasonTitle.localeCompare(a.seasonTitle)
          );
        });
      case "MOST RECENT":
        return episodes.sort((a, b) => {
          const dateA = new Date(a.time);
          const dateB = new Date(b.time);
          return (
            dateB - dateA ||
            a.showTitle.localeCompare(b.showTitle) ||
            a.seasonTitle.localeCompare(b.seasonTitle)
          );
        });
      case "LEAST RECENT":
        return episodes.sort((a, b) => {
          const dateA = new Date(a.time);
          const dateB = new Date(b.time);
          return (
            dateA - dateB ||
            a.showTitle.localeCompare(b.showTitle) ||
            a.seasonTitle.localeCompare(b.seasonTitle)
          );
        });
      default:
        return episodes;
    }
  };

  const groupedFavoriteEpisodes = favoriteEpisodes.reduce((acc, episode) => {
    const showTitle = episode.showTitle;
    const seasonTitle = episode.seasonTitle;
    const key = `${showTitle}-${episode.showId}`;

    if (!acc[key]) {
      acc[key] = {
        showTitle,
        episodes: [],
      };
    }

    acc[key].episodes.push({ ...episode, seasonTitle });
    return acc;
  }, {});

  let lastShowTitle = null;

  let renderedEpisodes;
  if (sortOption === "All") {
    renderedEpisodes = Object.entries(groupedFavoriteEpisodes).map(
      ([groupKey, groupData]) => {
        const { showTitle, episodes } = groupData;
        let lastSeasonTitle = null;

        return (
          <div key={groupKey} className="favorite-group">
            <h2>{showTitle}</h2>
            {episodes.map((episode, index) => {
              const {
                showId,
                seasonNumber,
                episodeNumber,
                id,
                time,
                seasonTitle,
              } = episode;
              const shouldRenderSeasonTitle = seasonTitle !== lastSeasonTitle;
              lastSeasonTitle = seasonTitle;

              return (
                <div key={index} className="favorite-episode">
                  <p>Added to Favorites: {new Date(time).toLocaleString()}</p>
                  {showsData.map((show) => {
                    if (show.id === showId && show.seasons[seasonNumber]) {
                      const episodeData =
                        show.seasons[seasonNumber].episodes[episodeNumber];
                      return (
                        <div key={episodeNumber}>
                          {shouldRenderSeasonTitle && (
                            <h3>Season: {seasonTitle}</h3>
                          )}
                          <p>Episode {episodeData.episode}</p>
                          <p>Title: {episodeData.title}</p>
                          <p>Description: {episodeData.description}</p>
                          <audio controls>
                            <source src={episodeData.file} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          <button onClick={() => handleRemoveFromFavorites(id)}>
                            Remove from Favorites
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
        );
      }
    );
  } else {
    const sortedEpisodes = sortEpisodes([...favoriteEpisodes], sortOption);

    renderedEpisodes = sortedEpisodes.map((episode, index) => {
      const {
        showId,
        seasonNumber,
        episodeNumber,
        id,
        time,
        showTitle,
        seasonTitle,
      } = episode;
      return (
        <div key={index} className="favorite-episode">
          <p>Added to Favorites: {new Date(time).toLocaleString()}</p>
          <p>Show Title: {showTitle}</p>
          <p>Season Title: {seasonTitle}</p>
          {showsData.map((show) => {
            if (show.id === showId && show.seasons[seasonNumber]) {
              const episodeData =
                show.seasons[seasonNumber].episodes[episodeNumber];
              return (
                <div key={episodeNumber}>
                  <p>Episode {episodeData.episode}</p>
                  <p>Title: {episodeData.title}</p>
                  <p>Description: {episodeData.description}</p>
                  <audio controls>
                    <source src={episodeData.file} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <button onClick={() => handleRemoveFromFavorites(id)}>
                    Remove from Favorites
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    });
  }

  useEffect(() => {
    document.addEventListener("play", handleAudioPlay, true);
    document.addEventListener("pause", handleAudioPause, true);

    const handleBeforeUnload = (event) => {
      if (audioPlaying) {
        event.preventDefault();
        event.returnValue =
          "Audio is still playing. Are you sure you want to leave the page?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("play", handleAudioPlay, true);
      document.removeEventListener("pause", handleAudioPause, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [showsData, userId, audioPlaying]);

  return (
    <div className="favorites-container">
      <h1>Favorites</h1>
      <AppBar style={{backgroundColor: 'crimson'}} position="relative">
        <Toolbar>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle1" color="inherit">
              Sort by:
            </Typography>
            <Select
              value={sortOption}
              onChange={handleSortChange}
              variant="outlined"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="A-Z">A-Z</MenuItem>
              <MenuItem value="Z-A">Z-A</MenuItem>
              <MenuItem value="MOST RECENT">Most Recent</MenuItem>
              <MenuItem value="LEAST RECENT">Least Recent</MenuItem>
            </Select>
          </Stack>
        </Toolbar>
      </AppBar>
      {isLoading ? <LoadingCard/> : renderedEpisodes}
    </div>
  );
};

export default Favorites;
