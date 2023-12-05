const validation = (validationRules, formInput) => {
  let allErrors = {};

  Object.keys(validationRules).forEach((name) => {
    const rulesArr = validationRules[name];

    rulesArr.forEach((rule) => {
      if (!allErrors[name]) {
        let result;
        switch (Array.isArray(rule)) {
          case true: {
            const [functionName, paramValue] = rule;
            result = functionName(formInput, name, paramValue);
            break;
          }

          default:
            result = rule(formInput, name);
            break;
        }
        if (result) {
          allErrors = { ...allErrors, ...result };
        }
      }
    });
  });

  return allErrors;
};

const FormValidation = ({ validationRules, formInput }) => {
  let errors = validation(validationRules, formInput);

  return { errors };
};

export const required = (formInputs, inputName) =>
  !formInputs[inputName] && { [inputName]: `${inputName} is required` };

export function roomPattern(formInputs, inputName) {
  const value = formInputs[inputName];

  let error;
  if (!/^[0-9]+$/.test(value)) {
    error = 'Your room must contain only number';
  }

  return (
    error && {
      [inputName]: error,
    }
  );
}

export default FormValidation;
