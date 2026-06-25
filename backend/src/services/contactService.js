import ContactRequest from '../models/contactRequestModel.js';

export const createContact = async (contactData, userId = null) => {
  const contact = await ContactRequest.create({
    ...contactData,
    userId
  });

  return contact.toJSON();
};

export const getContacts = async ({ page, limit }) => {
  const [contacts, total] = await Promise.all([
    ContactRequest.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactRequest.countDocuments()
  ]);

  return {
    contacts,
    pagination: {
      currentPage: page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
