import ServerError from "../../../components/Forms/ServerError";
import { useEffect, useState, useCallback } from "react";
import TextField from "../../../components/Forms/TextField";
import { useForm } from "../../../context/formContext";
import { useUser } from "../../../context/userContext";
import { Footer } from "../../../components/Console";
import { PrimaryPane, FormPane, FormInput } from "../../../components/Console";
import Button from "../../../components/Buttons/Button";
import isEqual from "lodash.isequal";
import { useRouting } from "../../../context/routingContext";
import { isEmpty, capitalize } from "../../../helpers";
import { NotificationManager } from "react-notifications";
import { updateFirestore } from "../../../firebase/clientApp";
import Checkbox from "../../../components/Buttons/Checkbox";
import Select from "../../../components/Forms/Select";
import MenuItem from "../../../components/Menus/MenuItem";
const style = {
  field: {
    flex: "1 1 0",
    minWidth: "134px",
    margin: "0 6px",
    maxWidth: "220px",
  },
};
const hoursObject = {
  'sunday': { open: { label: "10:00 AM", value: 10 }, close: { label: "10:00 PM", value: 22 } },
  'monday': { open: { label: "10:00 AM", value: 10 }, close: { label: "10:00 PM", value: 22 } },
  'tuesday': { open: { label: "10:00 AM", value: 10 }, close: { label: "10:00 PM", value: 22 } },
  'wednesday': { open: { label: "10:00 AM", value: 10 }, close: { label: "10:00 PM", value: 22 } },
  'thursday': { open: { label: "10:00 AM", value: 10 }, close: { label: "10:00 PM", value: 22 } },
  'friday': { open: { label: "10:00 AM", value: 10 }, close: { label: "10:00 PM", value: 22 } },
  'saturday': { open: { label: "10:00 AM", value: 10 }, close: { label: "10:00 PM", value: 22 } },
};
const defaultForm = {
  'sunday': false,
  'monday': false,
  'tuesday': false,
  'wednesday': false,
  'thursday': false,
  'friday': false,
  'saturday': false,
};
const hoursList = [
  { label: "24 hours", value: 24 },
  { label: "12:00 AM", value: 0 },
  //{label:'12:30 AM',value:0.5},
  { label: "1:00 AM", value: 1 },
  //{label:'1:30 AM',value:1.5},
  { label: "2:00 AM", value: 2 },
  //{label:'2:30 AM',value:2.5},
  { label: "3:00 AM", value: 3 },
  //{label:'3:30 AM',value:3.5},
  { label: "4:00 AM", value: 4 },
  //{label:'4:30 AM',value:4.5},
  { label: "5:00 AM", value: 5 },
  //{label:'5:30 AM',value:4.5},
  { label: "6:00 AM", value: 6 },
  //{label:'6:30 AM',value:4.5},
  { label: "7:00 AM", value: 7 },
  //{label:'7:30 AM',value:4.5},
  { label: "8:00 AM", value: 8 },
  //{label:'8:30 AM',value:4.5},
  { label: "9:00 AM", value: 9 },
  //{label:'9:30 AM',value:4.5},
  { label: "10:00 AM", value: 10 },
  //{label:'10:30 AM',value:4.5},
  { label: "11:00 AM", value: 11 },
  //{label:'11:30 AM',value:4.5},
  { label: "12:00 PM", value: 12 },
  //{label:'12:30 PM',value:4.5},
  { label: "1:00 PM", value: 13 },
  //{label:'1:30 AM',value:1.5},
  { label: "2:00 PM", value: 14 },
  //{label:'2:30 AM',value:2.5},
  { label: "3:00 PM", value: 15 },
  //{label:'3:30 AM',value:3.5},
  { label: "4:00 PM", value: 16 },
  //{label:'4:30 AM',value:4.5},
  { label: "5:00 PM", value: 17 },
  //{label:'5:30 AM',value:4.5},
  { label: "6:00 PM", value: 18 },
  //{label:'6:30 AM',value:4.5},
  { label: "7:00 PM", value: 19 },
  //{label:'7:30 AM',value:4.5},
  { label: "8:00 PM", value: 20 },
  //{label:'8:30 AM',value:4.5},
  { label: "9:00 PM", value: 21 },
  //{label:'9:30 AM',value:4.5},
  { label: "10:00 PM", value: 22 },
  //{label:'10:30 AM',value:4.5},
  { label: "11:00 PM", value: 23 },
  //{label:'11:30 AM',value:4.5},
];

const FeeSettings = () => {
  const { form, setForm, error, setError } = useForm();
  const { fireSettings } = useUser();
  const stack = true;
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [defaultData, setDefaultData] = useState(false);
  const { navLoading, setNavLoading } = useRouting();

  const defaultFees = {
    sunday_open: "",
    sunday_close: "",
    freeDeliveryMin: "",
    minOrder: "",
    exciseTax: "",
    stateTax: "",
    localTax: "",
  };

  const storeHours = [
    { day: "Sunday", open: "9:00am", close: "6:00pm" },
    { day: "Monday", open: "8:00am", close: "10:00pm" },
    { day: "Tuesday", open: "8:00am", close: "10:00pm" },
    { day: "Wednesday", open: "8:00am", close: "10:00pm" },
    { day: "Thursday", open: "8:00am", close: "10:00pm" },
    { day: "Friday", open: "8:00am", close: "10:00pm" },
    { day: "Saturday", open: "9:00am", close: "6:00pm" },
  ];

  const handleFormChange = (e, v) => {
    setForm({ ...{ ...form }, ...{ [`${e?.target?.name || ""}`]: v || "" } });
  };

  /* SET UP FORM */
  useEffect(() => {
    const tempForm = {};

    if (Boolean(fireSettings.status === 'success' && fireSettings.data)) {

      const _daysArr = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ]
      _daysArr.map((day)=>{
        //fireSettings
        tempForm[day] = fireSettings.data[day]
      })
      // for (const key in defaultForm) {
      //   const openCloseObj = defaultForm[key];
      //   tempForm[key] = openCloseObj;
      // }
      //setDefaultData({ ...tempForm });
      if(defaultData === false){
        setDefaultData({ ...tempForm })
      }

    }
    setForm({ ...tempForm });
    return () => {
      setForm({});
      setError({});
    };
  }, [defaultForm, fireSettings, defaultData]);

// useEffect(() => {
//   alert(JSON.stringify(form))
// }, [form]);

  const updateHours = useCallback(
    async (e) => {
      const _form = { ...form };
      const _error = { ...error };
      const _daysArr = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ]
      _daysArr.map((day)=>{
        if(day && _form[day] && typeof _form[day] === 'object'){
          if((!(_form[day].open && typeof _form[day].open.label === 'string' && typeof _form[day].open.value === 'number'))){
            _error[`${day}_open`] = "Open-time Required";
            //NotificationManager.error(_error[`${day}_open`]);
            //alert(1)
            setError({ ..._error });
          }
          if((!((_form[day].close && typeof _form[day].close.label === 'string' && typeof _form[day].close.value === 'number') || _form[day].open.value === 24))){
            _error[`${day}_close`] = "Close-time Required";
            //NotificationManager.error(_error[`${day}_close`]);
            //alert(_form[day].open.value)
            setError({ ..._error });
          }
          if((_form[day].close?.value < _form[day].open?.value  && _form[day].open.value !== 24 )){
            _error[`${day}_close`] = "Invalid";
            _error[`${day}_open`] = "Invalid";
            //alert(3)
            setError({ ..._error });
          }

        }
      })
      //alert(JSON.stringify(_error))
      if(!(_error && Object.keys(_error).length === 0 && _error.constructor === Object)){
        NotificationManager.error('Fix Errors');
        return
      }


      // if (isEmpty(`${_form?.deliveryFee || ""}`)) {
      //   _error.deliveryFee = "Minimum 0 required.";
      //   NotificationManager.error(_error.deliveryFee);
      //   return setError({ ..._error });
      // }

      // if (isEmpty(`${_form?.serviceFee || ""}`)) {
      //   _error.serviceFee = "Minimum 0 required.";
      //   NotificationManager.error(_error.serviceFee);
      //   return setError({ ..._error });
      // }


      setLoading(true);
      setNavLoading(true);
      try {
        await updateFirestore("admin", "store", _form);
        NotificationManager.success("Hours updated.");
        setDefaultData(_form)
      } catch (error) {
        if (error?.message) {
          setServerError(error?.message);
          //NotificationManager.error(error?.message);
        } else {
          NotificationManager.error("An error has occurred.");
        }
      } finally {
        setLoading(false);
        setNavLoading(false);
      }
    },
    [form, error, loading, navLoading]
  );
  const onChange = (event, props) => {
    let formClone = { ...form };
    if (props.isSelected === true) {
      formClone[props.name] = { open: { label: null, value: null }, close: { label: null, value: null } };
    } else {
      formClone[props.name] = false;
    }

    setError({});
    setForm(formClone);
  };
  const OpenClose = ({ day, dayObject }) => {
    const _day = day;
    return dayObject && _day ? (
      <>
        <div style={{ flexWrap: "wrap" }} className="dual-input">
          <Select
            id={`${_day}_open`}
            name={`${_day}_open`}
            floatingLabelText="Opens at"
            hintText="Select time"
            style={style.field}
            hasError={Boolean(error[`${_day}_open`])}
            onSelect={(_, v) =>
              (setError({}),setForm((oldForm) => {
                oldForm[_day].open = v;
                return oldForm;
                // { ...oldForm[_day].open, ...v }
              }))
            }
            selectedOption={form[_day]?.open?.label ? form[_day]?.open : undefined}
            { ...dayObject?.open?.value !== 24 ? {halfWidth:true} : {fullWidth:true}}
          >
            {hoursList ? (
              hoursList.map((x, i) => {
                if (x.label) {
                  return (
                    <MenuItem
                      key={i}
                      label={x.label}
                      value={x.value}
                    />
                  );
                }
              })
            ) : (
              <></>
            )}
          </Select>
          {(dayObject?.open?.value !== 24) && <Select
            id={`${_day}_close`}
            name={`${_day}_close`}
            floatingLabelText="Closes at"
            hintText="Select time"
            hasError={Boolean(error[`${_day}_close`])}
            onSelect={(_, v) =>
              (setError({}),
              setForm((oldForm) => {
                oldForm[_day].close = v;
                return oldForm;
              }))
            }
            selectedOption={form[_day]?.close?.label ? form[_day]?.close : undefined}
            style={style.field}
            halfWidth
          >
            {hoursList ? (
              hoursList.map((x, i) => {
                if (x.label) {
                  return (
                    <MenuItem
                      //leftIcon={'person'}
                      key={i}
                      label={x.label}
                      value={x.value}
                    />
                  );
                }
              })
            ) : (
              <></>
            )}
          </Select>}
        </div>
      </>
    ) : (
      <></>
    );
  };
  return (
    <>
      {/* OUTLET */}
      <PrimaryPane id="settings-collection">
        {/* FORM PANE */}
        <FormPane style={{ paddingBottom:'200px' }} >
          {/* SERVER ERROR */}
          <FormInput {...{ stack }}>{Boolean(serverError) && <ServerError text={`${serverError}`} />}</FormInput>

          {/*Sunday*/}
          <FormInput
            style={{ flexWrap: "wrap" }}
            label={
              <>
                <div style={{ display: "flex" }}>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>
                    <Checkbox name={"sunday"} id={"sunday"} onChange={onChange} isSelected={Boolean(form?.sunday)} />
                  </div>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>Sunday</div>
                </div>{" "}
              </>
            }
            {...{ stack }}
          >
            {form?.sunday ? (
              <OpenClose day="sunday" dayObject={form?.sunday} />
            ) : (
              <div
                style={{
                  height: "70px",
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  alignContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ flex: "1", color: "#bdbdbd" }}>Closed</div>
              </div>
            )}
          </FormInput>

          {/*Monday*/}
          <FormInput
            style={{ flexWrap: "wrap" }}
            label={
              <>
                <div style={{ display: "flex" }}>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>
                    <Checkbox name={"monday"} id={"monday"} onChange={onChange} isSelected={Boolean(form?.monday)} />
                  </div>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>Monday</div>
                </div>{" "}
              </>
            }
            {...{ stack }}
          >
            {form?.monday ? (
              <OpenClose day="monday" dayObject={form?.monday} />
            ) : (
              <div
                style={{
                  height: "70px",
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  alignContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ flex: "1", color: "#bdbdbd" }}>Closed</div>
              </div>
            )}
          </FormInput>

          {/*Tuesday*/}
          <FormInput
            style={{ flexWrap: "wrap" }}
            label={
              <>
                <div style={{ display: "flex" }}>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>
                    <Checkbox name={"tuesday"} id={"tuesday"} onChange={onChange} isSelected={Boolean(form?.tuesday)} />
                  </div>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>Tuesday</div>
                </div>{" "}
              </>
            }
            {...{ stack }}
          >
            {form?.tuesday ? (
              <OpenClose day="tuesday" dayObject={form?.tuesday} />
            ) : (
              <div
                style={{
                  height: "70px",
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  alignContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ flex: "1", color: "#bdbdbd" }}>Closed</div>
              </div>
            )}
          </FormInput>

          {/*Wednesday*/}
          <FormInput
            style={{ flexWrap: "wrap" }}
            label={
              <>
                <div style={{ display: "flex" }}>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>
                    <Checkbox
                      name={"wednesday"}
                      id={"wednesday"}
                      onChange={onChange}
                      isSelected={Boolean(form?.wednesday)}
                    />
                  </div>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>Wednesday</div>
                </div>{" "}
              </>
            }
            {...{ stack }}
          >
            {form?.wednesday ? (
              <OpenClose day="wednesday" dayObject={form?.wednesday} />
            ) : (
              <div
                style={{
                  height: "70px",
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  alignContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ flex: "1", color: "#bdbdbd" }}>Closed</div>
              </div>
            )}
          </FormInput>

          {/*Thursday*/}
          <FormInput
            style={{ flexWrap: "wrap" }}
            label={
              <>
                <div style={{ display: "flex" }}>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>
                    <Checkbox
                      name={"thursday"}
                      id={"thursday"}
                      onChange={onChange}
                      isSelected={Boolean(form?.thursday)}
                    />
                  </div>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>Thursday</div>
                </div>{" "}
              </>
            }
            {...{ stack }}
          >
            {form?.thursday ? (
              <OpenClose day="thursday" dayObject={form?.thursday} />
            ) : (
              <div
                style={{
                  height: "70px",
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  alignContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ flex: "1", color: "#bdbdbd" }}>Closed</div>
              </div>
            )}
          </FormInput>

          {/*Friday*/}
          <FormInput
            style={{ flexWrap: "wrap" }}
            label={
              <>
                <div style={{ display: "flex" }}>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>
                    <Checkbox name={"friday"} id={"friday"} onChange={onChange} isSelected={Boolean(form?.friday)} />
                  </div>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>Friday</div>
                </div>{" "}
              </>
            }
            {...{ stack }}
          >
            {form?.friday ? (
              <OpenClose day="friday" dayObject={form?.friday} />
            ) : (
              <div
                style={{
                  height: "70px",
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  alignContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ flex: "1", color: "#bdbdbd" }}>Closed</div>
              </div>
            )}
          </FormInput>

          {/*Saturday*/}
          <FormInput
            style={{ flexWrap: "wrap" }}
            label={
              <>
                <div style={{ display: "flex" }}>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>
                    <Checkbox
                      name={"saturday"}
                      id={"saturday"}
                      onChange={onChange}
                      isSelected={Boolean(form?.saturday)}
                    />
                  </div>
                  <div style={{ marginLeft: "10px", lineHeight: "22px" }}>Saturday</div>
                </div>{" "}
              </>
            }
            {...{ stack }}
          >
            {form?.saturday ? (
              <OpenClose day="saturday" dayObject={form?.saturday} />
            ) : (
              <div
                style={{
                  height: "70px",
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  alignContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ flex: "1", color: "#bdbdbd" }}>Closed</div>
              </div>
            )}
          </FormInput>
        </FormPane>
      </PrimaryPane>
      <Footer isShowing={!isEqual({ ...form }, { ...defaultData })}>
        <Button
          disabled={loading || navLoading || isEmpty(form) || isEqual({ ...form }, { ...defaultData })}
          loading={loading}
          onClick={updateHours}
          text="Save Changes"
        />
      </Footer>
    </>
  );
};
export default FeeSettings;
