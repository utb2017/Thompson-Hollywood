import React, { useState, useEffect, useRef, useCallback } from "react"
import TextField from "../components/Forms/TextField"
import ButtonTS from "../components/Buttons/ButtonTS"
import AuthLayout from "../layouts/AuthLayout"
import ServerError from "../components/Forms/ServerError"
//import { useUser } from "../context/userContext"
import { withRouter } from "next/router"
import Link from "next/link"
//import { normalizeInput } from "../helpers"
// import firebase, { reCaptcha } from "../firebase/clientApp"
import firebase, { 
  updateFirestore, 
  getUserByPhone, 
  deleteAuthUser, 
  mergeFirestore,
  updateFirestoreGroup,
  fireCloud,
  addCredit,
  findAddCustomer
} from "../firebase/clientApp"
//import { useAuth } from "../context/authContext"
//import AddressField from "../../components/Forms/AddressField"
import { useRouting } from "../context/routingContext"
import parsePhoneNumber, {
  AsYouType,
} from "libphonenumber-js"
import { Input } from "baseui/input";
import { styled } from "baseui";
import { Select } from "baseui/select";

import { Button, SIZE } from "baseui/button";
import {useStyletron} from 'baseui';
import { H5 } from "baseui/typography"

const signinProps = {
  showCrumbs: false,
  title: "Enter number.",
  caption: "Enter you cell number to sign in or create an account.",
}

const SignIn = ({ router }) => {
  //const { user, loadingUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState(null)
  //const {form, setForm} = useAuth()
  const {setNavLoading} = useRouting()


  const [value, setValue] = React.useState(``);
  const [value2, setValue2] = React.useState(``);
  const [value3, setValue3] = React.useState([]);
  
  return (
    <>
      <FlexParent1>
        <FlexChild1_1>
         <H5> Log In</H5>
          <Spacer/>
          <Input
            value={value}
            onChange={ (event) => {
              const target = event.target as HTMLInputElement;
              setValue(target.value)}
            }
            placeholder="Username"
            clearOnEscape
          />
          <Spacer/>
          <Input
            value={value2}
            onChange={ (event) => {
              const target = event.target as HTMLInputElement;
              setValue2(target.value)}
            }
            placeholder="Password"
            clearOnEscape
          />
          <Spacer/>
              <Select
                options={[
                  { label: "Thompson", id: "LAXTH" },
                  { label: "Tommie", id: "LAXTE" },
                ]}
                value={value3}
                placeholder="Select property"
                onChange={(params) => {
                  const value = params.value as [];
                  setValue3(value)
                }}
              />
              <Spacer/>
              <Link href={"/[property]/vip/[filter]"} as={`/${'LAXTH'}/vip/arriving`}>
              <ButtonMod
      //  onClick={() => alert("click")}
      size={SIZE.large}
    >
      Just Go
    </ButtonMod>                
              </Link>

        </FlexChild1_1>


      </FlexParent1>
    </>
  )
}

const FlexParent1 = styled("div", ({ $theme }) => {
  return {
    display:'flex',
    width: `100%`,
    flexDirection:`column`,
    backgroundColor:`#16365c`,
    alignItems:`center`,
    height:`100vh`,
    justifyContent:`center`,
    paddingBottom:'100px'
  };
});
const FlexChild1_1 = styled("div", ({ $theme }) => {
  return {
    display:`flex`,
    width:`100%`,
    maxWidth:`400px`,
    backgroundColor:`white`,
    flexDirection:`column`,
    flexPosition:`center`,
    alignItems:`center`,
    justifyContent:`center`,
    margin:`12px`,
    padding:`12px`,
  };
});
const Spacer = styled("div", ({ $theme }) => {
  return {
    display:`flex`,
    width:`100%`,
    height:'20px'
  };
});
const ButtonMod = styled(Button, ({ $theme }) => {
  return {
    display:`flex`,
    width:`100%`,
  
  };
});
export default withRouter(SignIn)
