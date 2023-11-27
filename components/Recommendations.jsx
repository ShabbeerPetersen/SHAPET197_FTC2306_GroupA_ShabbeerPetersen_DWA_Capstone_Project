import { Container } from '@mui/material';
import {
    MDBCarousel,
    MDBCarouselItem,
} from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import LoadingCard from './LoadingFav';

export default function Recommendations(props) {
    const { showsData, onShowClick } = props
    const { showData, apiComplete } = showsData
    const navigate = useNavigate()
    const featured = []
    for (let item of showData) {
        if (item.genres) {
            if (item.genres.includes('Featured'))
                featured.push(item)
        }
    }

    const handleShowClick = (showId) => {
        onShowClick(showId); // Update the currentShow in the App component's state
        navigate(`/shows/${showId}`); // navigate to the ShowDetails route using useNavigate
      };

    const elements = featured.map(item => {
        const { image, id } = item;
        return (
            <div key={id} onClick={() => handleShowClick(id)}>
                <MDBCarouselItem
                key={item.id}
                className='w-100 d-block hover-shadow rounded-4'
                itemId={item.id}
                src={image}
                alt='...'
                placeholder='Nope ...'
            >
            </MDBCarouselItem>
            </div>
        )
    })
    

    return (
        <>
            {!apiComplete ? <LoadingCard/> : <Container maxWidth="sm"><MDBCarousel showControls showIndicators hover-shadow fade dark className='parent'>
                <p className='recommended'>Shows you might like</p>
                {elements}
            </MDBCarousel></Container>}
        </>

    );
}