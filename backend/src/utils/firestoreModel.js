const { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  limit, 
  orderBy, 
  serverTimestamp,
  getCountFromServer,
  increment: firestoreIncrement
} = require("firebase/firestore");
const { db, admin, adminApp } = require("../config/firebase");

class FirestoreModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.isAdmin = !!adminApp;
    this.collectionRef = this.isAdmin ? db.collection(collectionName) : collection(db, collectionName);
  }

  // Helper to handle Sequelize-like where clauses (Op support)
  _processWhere(q, whereClause) {
    if (!whereClause) return q;

    Object.keys(whereClause).forEach(key => {
      const val = whereClause[key];
      
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        // Handle Sequelize Operators (simplified)
        Object.getOwnPropertySymbols(val).concat(Object.keys(val)).forEach(sym => {
          const opName = typeof sym === 'symbol' ? sym.description : sym;
          const opVal = val[sym];

          if (this.isAdmin) {
            if (opName === 'between') q = q.where(key, '>=', opVal[0]).where(key, '<=', opVal[1]);
            else if (opName === 'gte') q = q.where(key, '>=', opVal);
            else if (opName === 'gt') q = q.where(key, '>', opVal);
            else if (opName === 'lte') q = q.where(key, '<=', opVal);
            else if (opName === 'lt') q = q.where(key, '<', opVal);
            else if (opName === 'in') q = q.where(key, 'in', opVal);
            else if (opName === 'like') {
              // Firestore doesn't support LIKE. Best effort: prefix search
              const prefix = opVal.replace(/%/g, '');
              q = q.where(key, '>=', prefix).where(key, '<=', prefix + '\uf8ff');
            }
          } else {
            if (opName === 'between') {
              q = query(q, where(key, '>=', opVal[0]), where(key, '<=', opVal[1]));
            }
            else if (opName === 'gte') q = query(q, where(key, '>=', opVal));
            else if (opName === 'gt') q = query(q, where(key, '>', opVal));
            else if (opName === 'lte') q = query(q, where(key, '<=', opVal));
            else if (opName === 'lt') q = query(q, where(key, '<', opVal));
            else if (opName === 'in') q = query(q, where(key, 'in', opVal));
            else if (opName === 'like') {
              const prefix = opVal.replace(/%/g, '');
              q = query(q, where(key, '>=', prefix), where(key, '<=', prefix + '\uf8ff'));
            }
          }
        });
      } else {
        // Simple equality
        if (this.isAdmin) {
          q = q.where(key, "==", val);
        } else {
          q = query(q, where(key, "==", val));
        }
      }
    });
    return q;
  }

  async findAndCountAll({ where: whereClause = {}, limit: limitVal = 10, offset = 0, order = [] } = {}) {
    try {
      if (this.isAdmin) {
        let q = this._processWhere(this.collectionRef, whereClause);
        const totalCount = (await q.count().get()).data().count;

        if (order.length > 0) {
          const [field, direction] = order[0];
          q = q.orderBy(field, direction.toLowerCase());
        } else {
          q = q.orderBy("created_at", "desc");
        }

        if (limitVal) q = q.limit(parseInt(limitVal));
        if (offset > 0) q = q.offset(parseInt(offset));

        const snapshot = await q.get();
        const rows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return { count: totalCount, rows };
      } else {
        let q = this._processWhere(query(this.collectionRef), whereClause);
        const countSnapshot = await getCountFromServer(q);
        const totalCount = countSnapshot.data().count;

        if (order.length > 0) {
          const [field, direction] = order[0];
          q = query(q, orderBy(field, direction.toLowerCase()));
        } else {
          q = query(q, orderBy("created_at", "desc"));
        }

        if (limitVal) q = query(q, limit(parseInt(limitVal)));

        const querySnapshot = await getDocs(q);
        let rows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (offset > 0) rows = rows.slice(offset);

        return { count: totalCount, rows };
      }
    } catch (error) {
      console.error(`Firestore Error [findAndCountAll] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }

  async findAll(options = {}) {
    const { rows } = await this.findAndCountAll(options);
    return rows;
  }

  async findByPk(id) {
    try {
      if (!id) return null;
      if (this.isAdmin) {
        const docSnap = await this.collectionRef.doc(id.toString()).get();
        if (docSnap.exists) {
          const data = docSnap.data();
          return { 
            id: docSnap.id, 
            ...data, 
            update: (updateData) => this.update(docSnap.id, updateData) 
          };
        }
      } else {
        const docRef = doc(db, this.collectionName, id.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return { 
            id: docSnap.id, 
            ...data, 
            update: (updateData) => this.update(docSnap.id, updateData) 
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`Firestore Error [findByPk] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }

  async findOne(options = {}) {
    const { where: whereClause = {} } = options;
    try {
      if (this.isAdmin) {
        let q = this._processWhere(this.collectionRef, whereClause).limit(1);
        const snapshot = await q.get();
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          return { id: docSnap.id, ...docSnap.data(), update: (data) => this.update(docSnap.id, data) };
        }
      } else {
        let q = this._processWhere(query(this.collectionRef), whereClause);
        q = query(q, limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          return { id: docSnap.id, ...docSnap.data(), update: (data) => this.update(docSnap.id, data) };
        }
      }
      return null;
    } catch (error) {
      console.error(`Firestore Error [findOne] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }

  async create(data) {
    try {
      const docData = {
        ...data,
        created_at: this.isAdmin ? admin.firestore.FieldValue.serverTimestamp() : serverTimestamp(),
        updated_at: this.isAdmin ? admin.firestore.FieldValue.serverTimestamp() : serverTimestamp()
      };

      if (this.isAdmin) {
        const docRef = await this.collectionRef.add(docData);
        return { id: docRef.id, ...docData };
      } else {
        const docRef = await addDoc(this.collectionRef, docData);
        return { id: docRef.id, ...docData };
      }
    } catch (error) {
      console.error(`Firestore Error [create] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const updateData = {
        ...data,
        updated_at: this.isAdmin ? admin.firestore.FieldValue.serverTimestamp() : serverTimestamp()
      };

      if (this.isAdmin) {
        await this.collectionRef.doc(id.toString()).update(updateData);
      } else {
        const docRef = doc(db, this.collectionName, id.toString());
        await updateDoc(docRef, updateData);
      }
      return { id, ...updateData };
    } catch (error) {
      console.error(`Firestore Error [update] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }

  async increment(field, options = {}) {
    const { by = 1, where: whereClause } = options;
    const records = await this.findAll({ where: whereClause });
    for (const record of records) {
      await this.update(record.id, {
        [field]: this.isAdmin ? admin.firestore.FieldValue.increment(by) : firestoreIncrement(by)
      });
    }
  }

  async decrement(field, options = {}) {
    const { by = 1, where: whereClause } = options;
    await this.increment(field, { by: -by, where: whereClause });
  }

  async delete(id) {
    try {
      if (this.isAdmin) {
        await this.collectionRef.doc(id.toString()).delete();
      } else {
        const docRef = doc(db, this.collectionName, id.toString());
        await deleteDoc(docRef);
      }
      return true;
    } catch (error) {
      console.error(`Firestore Error [delete] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }

  async destroy(options = {}) {
    const { where: whereClause } = options;
    const records = await this.findAll({ where: whereClause });
    for (const record of records) {
      await this.delete(record.id);
    }
    return records.length;
  }

  async count(options = {}) {
    try {
      if (this.isAdmin) {
        let q = this._processWhere(this.collectionRef, options.where);
        const countSnapshot = await q.count().get();
        return countSnapshot.data().count;
      } else {
        let q = this._processWhere(query(this.collectionRef), options.where);
        const countSnapshot = await getCountFromServer(q);
        return countSnapshot.data().count;
      }
    } catch (error) {
      console.error(`Firestore Error [count] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }

  async sum(field, options = {}) {
    const records = await this.findAll(options);
    return records.reduce((total, record) => total + (parseFloat(record[field]) || 0), 0);
  }
}

module.exports = FirestoreModel;
