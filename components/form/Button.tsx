import { useState, useEffect } from "react";

type Props = {
  disabled: boolean;
  loading: boolean;
  text: string;
  className: string;
  type: "button" | "submit";
  variant: "primary" | "secondary" | "auth";
};

const Button: React.FunctionComponent<Props> = ({
  disabled,
  loading = false,
  text,
  className,
  type,
  variant = "primary",
}) => {
  const [style, setStyle] = useState<any | null>(null);

  /** Button CSS **/
  useEffect(() => {
    const button = ["new-user-form-submit-button", "button"];
    if (disabled || loading) button.push("disabled");
    else {
      if (className) button.push(className.toString());
      if (variant) button.push(variant.toString());
    }
    setStyle(button.join(" "));
  }, [disabled, loading, variant]);

  return (
    <div>
      <button type={type} className={style} disabled={loading}>
        {!loading && text}
        {loading && (
          <div className="inline-loading">
            <div className="spinner" />
            <span>Loading...</span>
          </div>
        )}
      </button>
    </div>
  );
};

export { Button };

