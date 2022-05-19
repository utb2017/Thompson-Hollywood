import React from "react";
import PropTypes from "prop-types";

Form.propTypes = {
  /** POST method default */
  method:PropTypes.string,
  /** Form html className */
  className: PropTypes.string,
  /** Form html children */
  children: PropTypes.node,
  /** onSubmit callback will pass in model as parameter */
  onSubmit: PropTypes.func,
};

const handleSubmit = async (event, onSubmit) => {
  event.preventDefault();
  const form = event.target
  const formData = new window.FormData(form)
  const modal = {};
  for(let data of formData.entries()) {
   modal[data[0]]=data[1];
  }
  form.reset()
  onSubmit && onSubmit(modal);
  return modal;
}

function Form({
  children,
  onSubmit,
  className, 
  method="POST"
}) {
  return (
    <form
     onSubmit={(event)=>handleSubmit(event, onSubmit)} 
     className={className}
     method={method}   
    >
      {children}
    </form>
  );
}


Form.whyDidYouRender = true

export default Form;
