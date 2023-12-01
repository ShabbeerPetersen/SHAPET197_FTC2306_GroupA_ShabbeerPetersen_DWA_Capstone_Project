import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Fuse from "fuse.js";

const genreList = [
  "Business",
  "Comedy",
  "Entertainment",
  "Fiction",
  "History",
  "Kids and Family",
  "News",
  "Personal Growth",
  "True Crime and Investigative Journalism",
];

function LandingPage(props) {
  const { showsData, onShowClick } = props;
  const { previewData } = showsData;

  const [sortingMethod, setSortingMethod] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    setSortedData(sortData(sortingMethod));
  }, [sortingMethod]);

  const navigate = useNavigate();

  const shortenString = (text, maxLength, readMoreText = "... Open to read more") => {
    if (text.length <= maxLength) {
      return text;
    }
    const shortenedText = text.slice(0, maxLength).trim();
    return `${shortenedText}${readMoreText}`;
  };

  const sortData = (method) => {
    switch (method) {
      case "A-Z":
        return previewData
          .slice()
          .sort((a, b) => a.title.localeCompare(b.title));
      case "Z-A":
        return previewData
          .slice()
          .sort((a, b) => b.title.localeCompare(a.title));
      case "MOST RECENT":
        return previewData
          .slice()
          .sort((a, b) => new Date(b.updated) - new Date(a.updated));
      case "LEAST RECENT":
        return previewData
          .slice()
          .sort((a, b) => new Date(a.updated) - new Date(b.updated));
      default:
        return previewData;
    }
  };

  const fuse = new Fuse(sortedData, {
    keys: ["title", "description", "genres"],
    threshold: 0.4,
    includeScore: true,
  });

  const handleShowClick = (showId) => {
    onShowClick(showId);
    navigate(`/shows/${showId}`);
  };

  const handleSortChange = (event) => {
    setSortingMethod(event.target.value);
  };

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : sortedData;

  const filteredDataByGenre =
    selectedGenre === "All"
      ? filteredData
      : filteredData.filter((item) =>
          item.genres.includes(genreList.indexOf(selectedGenre) + 1)
        );

  const elements = filteredDataByGenre.map((item) => {
    const { id, title, description, seasons, image, genres, updated } = item;
    const maxLength = 100;
    const shortenedDescription = shortenString(description, maxLength);
    const genresWithNames = genres
      ? genres.map((num) => genreList[num - 1])
      : [];

    function formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${day}-${month}-${year}`;
    }

    return (
      <Grid
        item
        key={id}
        xs={12}
        sm={6}
        md={4}
        onClick={() => handleShowClick(id)}
      >
        <Card className="rounded-4 hover-shadow" sx={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "lightgray" }} >
          <CardMedia component="div" sx={{ pt: "100%" }} image={image} />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            <Typography>{shortenedDescription}</Typography>
          </CardContent>
          <CardContent>
            <Typography>Seasons: {seasons}</Typography>
          </CardContent>
          <CardContent>
            <Typography>Genres: {genresWithNames.join(", ")}</Typography>
          </CardContent>
          <CardActions>
            <Typography>Last updated: {formatDate(updated)}</Typography>
          </CardActions>
        </Card>
      </Grid>
    );
  });

  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <AppBar position="relative" sx={{ backgroundColor: 'crimson' }}>
        <Toolbar>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle1" color="inherit">
              Sort:
            </Typography>
            <Select className=" hover-shadow"
              value={sortingMethod}
              onChange={handleSortChange}
              variant="outlined"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="A-Z">Alphabetical</MenuItem>
              <MenuItem value="Z-A">Anti-Alphabetical</MenuItem>
              <MenuItem value="MOST RECENT">Most Recent</MenuItem>
              <MenuItem value="LEAST RECENT">Least Recent</MenuItem>
            </Select>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle1" color="inherit">
              Sort by Genre:
            </Typography>
            <Select className=" hover-shadow"
              value={selectedGenre}
              onChange={handleGenreChange}
              variant="outlined"
            >
              <MenuItem value="All">All Genres</MenuItem>
              {genreList.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Toolbar>
        <Toolbar>
          <input
            type="text"
            placeholder="Got a show in mind? Search here..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              fontSize: "1rem",
              marginBottom: "8px",
            }}
          />
        </Toolbar>
      </AppBar>
      <main>
        <Container sx={{ py: 2 }} maxWidth="md">
          <Grid container spacing={4}>
            {elements}
          </Grid>
        </Container>
      </main>
    </ThemeProvider>
  );
}

export default LandingPage;
