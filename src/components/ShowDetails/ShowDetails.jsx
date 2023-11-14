// ShowDetails.jsx

import React, { useState, useEffect } from 'react';

const ShowDetails = ({ match }) => {
  const [show, setShow] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowData = async () => {
      try {
        const response = await fetch(`https://podcast-api.netlify.app/shows/${match.params.showId}`);
        const data = await response.json();
        setShow(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching show data:', error);
        setLoading(false);
      }
    };

    fetchShowData();
  }, [match.params.showId]);

  return (
    <div>
      {loading ? <p>Loading show details...</p> : (
        <div>
          <h2>{show.title}</h2>
          <p>{show.description}</p>
          {/* Display other show details as needed */}
        </div>
      )}
    </div>
  );
};

export default ShowDetails;
