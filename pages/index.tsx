import React from "react";
import { withRouter } from "next/router";
import Link from "next/link";
import { Input } from "baseui/input";
import { styled } from "baseui";
import { Select } from "baseui/select";
import { Button, SIZE } from "baseui/button";
import { HeadingMedium } from "baseui/typography";

const SignIn = ({ router }) => {
  const [value, setValue] = React.useState(``);
  const [value2, setValue2] = React.useState(``);
  const [value3, setValue3] = React.useState([]);

  return (
    <>
      <FlexParent1>
        <FlexChild1_1>
          <HeadingMedium> Log In</HeadingMedium>
          <Spacer />
          <Input
            value={value}
            onChange={(event) => {
              const target = event.target as HTMLInputElement;
              setValue(target.value);
            }}
            placeholder="Username"
            clearOnEscape
            disabled
          />
          <Spacer />
          <Input
            value={value2}
            onChange={(event) => {
              const target = event.target as HTMLInputElement;
              setValue2(target.value);
            }}
            placeholder="Password"
            clearOnEscape
            disabled
          />
          <Spacer />
          <Select
            options={[
              { label: "Thompson", id: "LAXTH" },
              { label: "Tommie", id: "LAXTE" },
            ]}
            value={value3}
            placeholder="Select property"
            onChange={(params) => {
              const value = params.value as [];
              setValue3(value);
            }}
          />
          <Spacer />
          <Link
            href={"/[property]/vip/[filter]"}
            as={`/${value3[0]?.id||`LAXTH`}/vip/arriving`}
          >
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
  );
};

const FlexParent1 = styled("div", () => {
  return {
    display: "flex",
    width: `100%`,
    flexDirection: `column`,
    backgroundColor: `#16365c`,
    alignItems: `center`,
    height: `100vh`,
    justifyContent: `center`,
    paddingBottom: "100px",
  };
});
const FlexChild1_1 = styled("div", () => {
  return {
    display: `flex`,
    width: `100%`,
    maxWidth: `400px`,
    backgroundColor: `white`,
    flexDirection: `column`,
    flexPosition: `center`,
    alignItems: `center`,
    justifyContent: `center`,
    margin: `12px`,
    padding: `12px`,
  };
});
const Spacer = styled("div", () => {
  return {
    display: `flex`,
    width: `100%`,
    height: "20px",
  };
});
const ButtonMod = styled(Button, () => {
  return {
    display: `flex`,
    width: `100%`,
  };
});
export default withRouter(SignIn);
