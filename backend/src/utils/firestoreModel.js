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
  getCountFromServer
} = require("firebase/firestore");
const { db, admin } = require("../config/firebase");

class FirestoreModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.isAdmin = !!admin && !!admin.apps.length;
    this.collectionRef = this.isAdmin ? db.collection(collectionName) : collection(db, collectionName);
  }

  async findAndCountAll({ where: whereClause = {}, limit: limitVal = 10, offset = 0, order = [] } = {}) {
    try {
      if (this.isAdmin) {
        // Firebase Admin SDK Logic
        let q = this.collectionRef;
        Object.keys(whereClause).forEach(key => {
          q = q.where(key, "==", whereClause[key]);
        });

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
        // Firebase Client SDK Logic
        let q = query(this.collectionRef);
        Object.keys(whereClause).forEach(key => {
          q = query(q, where(key, "==", whereClause[key]));
        });

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
          return { 
            id: docSnap.id, 
            ...docSnap.data(), 
            update: (data) => this.update(docSnap.id, data) 
          };
        }
      } else {
        const docRef = doc(db, this.collectionName, id.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { 
            id: docSnap.id, 
            ...docSnap.data(), 
            update: (data) => this.update(docSnap.id, data) 
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`Firestore Error [findByPk] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }

  async findOne({ where: whereClause = {} } = {}) {
    try {
      if (this.isAdmin) {
        let q = this.collectionRef.limit(1);
        Object.keys(whereClause).forEach(key => {
          q = q.where(key, "==", whereClause[key]);
        });
        const snapshot = await q.get();
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          return { id: docSnap.id, ...docSnap.data(), update: (data) => this.update(docSnap.id, data) };
        }
      } else {
        let q = query(this.collectionRef, limit(1));
        Object.keys(whereClause).forEach(key => {
          q = query(q, where(key, "==", whereClause[key]));
        });
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
      if (error.message.includes('PERMISSION_DENIED')) {
        console.error('ACTION REQUIRED: Update your Firestore Security Rules in the Firebase Console.');
      }
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

  async count(options = {}) {
    try {
      if (this.isAdmin) {
        let q = this.collectionRef;
        if (options.where) {
          Object.keys(options.where).forEach(key => {
            q = q.where(key, "==", options.where[key]);
          });
        }
        const countSnapshot = await q.count().get();
        return countSnapshot.data().count;
      } else {
        let q = query(this.collectionRef);
        if (options.where) {
          Object.keys(options.where).forEach(key => {
            q = query(q, where(key, "==", options.where[key]));
          });
        }
        const countSnapshot = await getCountFromServer(q);
        return countSnapshot.data().count;
      }
    } catch (error) {
      console.error(`Firestore Error [count] for ${this.collectionName}:`, error.message);
      throw error;
    }
  }
}

module.exports = FirestoreModel;
