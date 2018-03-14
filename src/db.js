// transform from key/value to list and back
const transform = (data) => {
  let attributes;
  if (Array.isArray(data)) {
    attributes = {};
    data.forEach((aPair) => {
      if (!attributes[aPair.Name]) {
        attributes[aPair.Name] = {};
      }
      attributes[aPair.Name] = aPair.Value;
    });
  } else {
    attributes = [];
    Object.keys(data).forEach((anAttributeName) => {
      if (Array.isArray(data[anAttributeName])) {
        data[anAttributeName].forEach((aValue) => {
          attributes.push({
            Name: anAttributeName,
            Value: aValue,
          });
        });
      } else {
        attributes.push({
          Name: anAttributeName,
          Value: data[anAttributeName],
        });
      }
    });
  }
  return attributes;
};

export default class Db {

  constructor(sdb, tableName) {
    this.sdb = sdb;
    this.tableName = tableName;
  }

  setPromoCodeEmail(promoCode, email) {
    return this.putAttributes({
      DomainName: this.tableName,
      ItemName: promoCode,
      Attributes: [
        { Name: 'promoCode', Value: promoCode },
        { Name: 'email', Value: email },
        { Name: 'claimed', Value: String(Math.round(Date.now() / 1000)) },
      ],
    });
  }

  async getPromoCode(promoCode) {
    const data = await this.getAttributes({
      DomainName: this.tableName,
      ItemName: promoCode,
    });

    if (!data.Attributes) {
      return null;
    }

    return transform(data.Attributes);
  }

  method(name, params) {
    return new Promise((resolve, reject) => {
      this.sdb[name](params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  putAttributes(params) {
    return this.method('putAttributes', params);
  }

  select(params) {
    return this.method('select', params);
  }

  getAttributes(params) {
    return this.method('getAttributes', params);
  }

  deleteAttributes(params) {
    return this.method('deleteAttributes', params);
  }

}
