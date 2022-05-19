import React from "react";



function Product({form:{
  name = "Banana",
  img = ["https://firebasestorage.googleapis.com/v0/b/bronto-eff70.appspot.com/o/placeholders%2Fstock-placeholder-blue.png?alt=media&token=fe1924a0-8bff-43f6-858d-b6d5e3e8ff27"],
  genome = "hybrid",
  price = 70,
  size = "1g",
  brand = "House",
}}) {


  return (
    <li className="item-card in-cart">
      <div
        style={{
          position: "relative",
          paddingBottom: 16,
          height: "100%",
          overflow: "visible",
        }}
      >


          <div>
            <div className="item-card-contents" data-radium="true">
              <div className="media quick-add-view-allowed" data-radium="true">
                <div className="item-card-image-wrapper" data-radium="true">
                  <img
                    className="no-aliasing-image item-image preview"
                    src={img[0]}
                    alt={name}
                    data-radium="true"
                  />
                </div>
              </div>
              <div
                id="itemInfo-item_138400468"
                className="item-info"
                data-radium="true"
              >
                <div className="item-name item-row" data-radium="true">
                  <div>
                    <div style={{ display: "flex" }}>
                      <div className="item-price" style={{ flex: "1 1 0%" }}>
                        <span>
                          <span>{Boolean(price) ? parseFloat(price).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            }):"$0.00"}</span>
                          <span aria-label="per eighth" style={{ fontSize: 10 }}>
                            &nbsp;{Boolean((size||'').length) ? size : "Weight"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="full-item-name" data-radium="true">
                    {(name||'').length ? name : "Name"}
                  </span>
                  <span className="item-size muted">
                    <span aria-label={genome}>
                        {Boolean((brand||'').length) ? brand : "Brand"}
                    </span>
                  </span><br/>
                  <span className="item-size muted">
                    <span aria-label={genome}>
                        {Boolean(genome) ? genome : "Type"}
                    </span>
                  </span>
                </div>
              </div>
              <div
                data-radium="true"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 22,
                  marginBottom: 10,
                  textAlign: "center",
                  padding: "0px 20px",
                  color: "#1a73e8",
                }}
              />
            </div>
          </div>

        <span>
        </span>
      </div>
    </li>
  );
}

export default Product;
