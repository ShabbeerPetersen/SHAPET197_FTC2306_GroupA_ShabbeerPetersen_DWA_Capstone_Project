// PodcastList.jsx

import React, { useState, useEffect } from 'react';

const PodcastList = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://podcast-api.netlify.app/shows');
        const data = await response.json();
        setShows(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching show data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading ? <p>Loading shows...</p> : (
        <ul>
          {shows.map(show => (
            <li key={show.id}>{show.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PodcastList;
