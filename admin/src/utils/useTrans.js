import { useIntl } from "react-intl";
import getTrad from "./getTrad";

export const useTrans = () => {
  const { formatMessage } = useIntl();
  //   return formatMessage({ id: getTrad(label) });
  const trans = (label, defaultMessage) =>
    formatMessage({
      id: getTrad(label),
      defaultMessage: defaultMessage || label,
    });
  return [trans];
};
