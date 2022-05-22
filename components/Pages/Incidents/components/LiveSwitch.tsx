

import { useForm } from "../../../../context/formContext";
import { Checkbox, LABEL_PLACEMENT, STYLE_TYPE } from "baseui/checkbox";
import { styled } from "styletron-react";
import { ProductClass } from "../types";
const SwitchBox = styled("div", {
  display: `flex`,
  justifyContent: `flex-end`,
  marginBottom: `12px`,
  maxWidth: "438px",
});
const LiveSwitch = () => {
  const { form, setForm, loading } = useForm();
  return (
    <SwitchBox>
      <Checkbox
        checkmarkType={STYLE_TYPE.toggle_round}
        checked={form?.active}
        onChange={(e) => setForm((oldForm: ProductClass) => ({ ...oldForm, ...{ active: e.currentTarget.checked }})
        )}
        labelPlacement={LABEL_PLACEMENT.left}
        disabled={loading}
      >
        {`Set Live ?`}
      </Checkbox>
    </SwitchBox>
  );
};
export default LiveSwitch;
