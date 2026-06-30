import * as contactService from '../services/contactService.js';
import {
  validateContactId,
  validateContactPagination,
  validateContactResponseStatus,
  validateCreateContact
} from '../validations/contactValidation.js';
import { sendSuccess } from '../utils/response.js';

export const createContact = async (req, res, next) => {
  try {
    const result = await contactService.createContact(
      validateCreateContact(req.body),
      req.user?.id || null
    );

    sendSuccess(res, {
      statusCode: 201,
      message: 'Gửi thông tin liên hệ thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const result = await contactService.getContacts(validateContactPagination(req.query));

    sendSuccess(res, {
      message: 'Lấy danh sách liên hệ thành công',
      data: result.contacts,
      meta: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactResponseStatus = async (req, res, next) => {
  try {
    const result = await contactService.updateContactResponseStatus(
      validateContactId(req.params.id),
      validateContactResponseStatus(req.body)
    );

    sendSuccess(res, {
      message: 'Cáº­p nháº­t tráº¡ng thÃ¡i pháº£n há»“i liÃªn há»‡ thÃ nh cÃ´ng',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
