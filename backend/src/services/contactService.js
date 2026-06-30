import ContactRequest from '../models/contactRequestModel.js';
import HttpError from '../utils/httpError.js';

const mapContact = (contact) => ({
  ...contact,
  isRessponsed: Boolean(contact.isRessponsed)
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createContact = async (contactData, userId = null) => {
  const contact = await ContactRequest.create({
    ...contactData,
    userId
  });

  return contact.toJSON();
};

export const getContacts = async ({ page, limit, search, isRessponsed }) => {
  const filter = {};

  if (typeof isRessponsed === 'boolean') filter.isRessponsed = isRessponsed;

  if (search) {
    const regex = { $regex: escapeRegex(search), $options: 'i' };
    filter.$or = [
      { senderName: regex },
      { phone: regex },
      { email: regex },
      { address: regex },
      { province: regex },
      { topic: regex },
      { message: regex }
    ];
  }

  const [contacts, total] = await Promise.all([
    ContactRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactRequest.countDocuments(filter)
  ]);

  return {
    contacts: contacts.map(mapContact),
    pagination: {
      currentPage: page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const updateContactResponseStatus = async (id, isRessponsed) => {
  const contact = await ContactRequest.findByIdAndUpdate(
    id,
    { isRessponsed },
    { new: true, runValidators: true }
  ).lean();

  if (!contact) throw new HttpError(404, 'Contact not found');

  return mapContact(contact);
};
