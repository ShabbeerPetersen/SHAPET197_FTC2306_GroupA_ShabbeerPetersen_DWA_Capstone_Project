// @ts-nocheck

import { useEffect } from "react";
import { useState } from "react";
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBCollapse,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase";

function Header(props) {

  const [userId, setUserId] = useState('') 
  const { signedIn } = props;
  const [showBasic, setShowBasic] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function getUserAndLog() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user.id);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    getUserAndLog();
  }, []);

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleFavoritesClick = () => {
    navigate(`/favorites/${userId}`);
  };

  return (
    <div className="stickyHeader">
      <MDBNavbar expand="lg" style={{ backgroundColor: '#DC143C' }}>
        <MDBContainer fluid>
        <img
              src="https://i.postimg.cc/j2PMJrCp/pngwing-com.png"
              alt="Logo"
              style={{ height: '40px', marginRight: '10px' }}
            />
          <MDBNavbarBrand href="#">
            MetaPod
          </MDBNavbarBrand>

          <MDBNavbarToggler
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => setShowBasic(!showBasic)}
          >
            <MDBIcon icon="bars" fas />
          </MDBNavbarToggler>

          <MDBCollapse navbar show={showBasic}>
            <MDBNavbarNav className="mr-auto mb-2 mb-lg-0">
              <MDBNavbarItem>
                <MDBNavbarLink className=" hover-shadow" onClick={handleHomeClick}>Home</MDBNavbarLink>
              </MDBNavbarItem>

              <MDBNavbarItem>
                {signedIn ? (
                  <MDBNavbarLink className=" hover-shadow" onClick={handleFavoritesClick}>Favourites</MDBNavbarLink>
                ) : (
                  <MDBNavbarLink
                    disabled
                    href="#"
                    tabIndex={-1}
                    aria-disabled="true"
                  >
                    You need to be signed in to access your Favourites
                  </MDBNavbarLink>
                )}
              </MDBNavbarItem>

              <MDBNavbarItem>
                <MDBNavbarLink className=" hover-shadow" href="/login">
                  {signedIn ? "Log out" : "Log in"}
                </MDBNavbarLink>
              </MDBNavbarItem>
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBContainer>
      </MDBNavbar>
    </div>
  );
}

export default Header;
