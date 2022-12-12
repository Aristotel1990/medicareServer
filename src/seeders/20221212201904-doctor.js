"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "Doctor",
      [
        {
          name: "Doctor 1",
          nipt: "LT123456NP",
          nid: "A1234567B",
          email: "doctor@test.com",
          phone: "0691234567",
          profile: "Neurologyst",
          comment: "",
          addressText: "Blv Bajram Curri",
          postgraduate: "Associate",
          undergraduate: "MD",
          hospital: "Nene tereza",
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          name: "Doctor 2",
          nipt: "LT123456ND",
          nid: "A1234567C",
          email: "doctor2@test.com",
          phone: "0691234568",
          profile: "Neurologyst",
          comment: "",
          addressText: "Blv Bajram Curri",
          postgraduate: "Associate",
          undergraduate: "MD",
          hospital: "Nene tereza",
          createdAt: new Date(),
          updatedAt: null,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Doctor", null, {});
  },
};
