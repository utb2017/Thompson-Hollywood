import faker, { fake } from 'faker';

export const realData = (rows = 10, fireData) => {
    const data = [];
    const object1 = fireData?.data || {};
    for (const [key, value] of Object.entries(object1)) {
      const row = faker.helpers.createCard()
      //alert(`${key}: ${value}`);
      //alert(`row  ${JSON.stringify(row)}`)
      data.push({
        [key]: value,
      });
    }
    return data;
  }