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
  startAfter,
  serverTimestamp,
  getCountFromServer
} = require("firebase/firestore");
const { db } = require("../config/firebase");

class FirestoreModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  async findAndCountAll({ where: whereClause = {}, limit: limitVal = 10, offset = 0, order = [] } = {}) {
    let q = query(this.collectionRef);

    // Apply where clauses
    Object.keys(whereClause).forEach(key => {
      q = query(q, where(key, "==", whereClause[key]));
    });

    // Count total
    const countSnapshot = await getCountFromServer(q);
    const totalCount = countSnapshot.data().count;

    // Apply ordering
    if (order.length > 0) {
      const [field, direction] = order[0];
      q = query(q, orderBy(field, direction.toLowerCase()));
    } else {
      q = query(q, orderBy("created_at", "desc"));
    }

    // Apply limit
    if (limitVal) {
      q = query(q, limit(parseInt(limitVal)));
    }

    // Offset is tricky in Firestore (usually done with startAfter)
    // For simplicity in this migration, we'll fetch and slice if offset is used
    // though it's not efficient for large datasets.
    const querySnapshot = await getDocs(q);
    let rows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (offset > 0) {
      rows = rows.slice(offset);
    }

    return { count: totalCount, rows };
  }

  async findAll(options = {}) {
    const { rows } = await this.findAndCountAll(options);
    return rows;
  }

  async findByPk(id) {
    if (!id) return null;
    const docRef = doc(db, this.collectionName, id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), update: (data) => this.update(docSnap.id, data) };
    }
    return null;
  }

  async findOne({ where: whereClause = {} } = {}) {
    let q = query(this.collectionRef, limit(1));
    Object.keys(whereClause).forEach(key => {
      q = query(q, where(key, "==", whereClause[key]));
    });
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data(), update: (data) => this.update(docSnap.id, data) };
    }
    return null;
  }

  async create(data) {
    const docData = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    const docRef = await addDoc(this.collectionRef, docData);
    return { id: docRef.id, ...docData };
  }

  async update(id, data) {
    const docRef = doc(db, this.collectionName, id.toString());
    const updateData = {
      ...data,
      updated_at: serverTimestamp()
    };
    await updateDoc(docRef, updateData);
    return { id, ...updateData };
  }

  async delete(id) {
    const docRef = doc(db, this.collectionName, id.toString());
    await deleteDoc(docRef);
    return true;
  }

  // Mimic Sequelize count
  async count(options = {}) {
    let q = query(this.collectionRef);
    if (options.where) {
      Object.keys(options.where).forEach(key => {
        q = query(q, where(key, "==", options.where[key]));
      });
    }
    const countSnapshot = await getCountFromServer(q);
    return countSnapshot.data().count;
  }
}

module.exports = FirestoreModel;
