class ConfigsController < ApplicationController
  before_action :require_login

  # TODO use anchor or param to show a specified settings tab
  def index
  end

  def update_csv_config
    if current_user.csv_config.update(csv_params)
      current_user.csv_config.destroy_blanks
      add_field # TODO remove this after the Settings page is reactive.
      redirect_to settings_path + "#csv", notice: @notice || "CSV settings updated."
    else
      render :index
    end
  end

  def update_visibility_config
    if current_user.visibility_configs.find_by(level: params[:level]).update(visibility_params)
      redirect_to settings_path + "#visibility", notice: "Visibility settings updated."
    else
      render :index
    end
  end

  def update_account_config
    if current_user.update(account_params)
      redirect_to settings_path + "#account", notice: "Account settings updated."
    else
      render :index
    end
  end

  private

  def add_field
    if params[:config_add_csv_format]
      current_user.csv_config.formats.create
      @notice = "Blank format added."
    elsif params[:config_add_csv_type]
      current_user.csv_config.types.create
      @notice = "Blank type added."
    elsif params[:config_add_csv_column]
      current_user.csv_config.custom_columns.create
      @notice = "Blank column added."
    else
      @notice = nil
    end
  end

  def csv_params
    params.require(:csv_config)
          .permit(:formats_attributes,
                  :types_attributes,
                  :custom_columns_attributes,
                  :rating_enabled,
                  :sources_isbn_enabled,
                  :dates_started_enabled,
                  :genres_enabled,
                  :length_enabled,
                  :public_notes_enabled,
                  :blurb_enabled,
                  :private_notes_enabled,
                  :history_enabled,
                  :maximum_rating,
                  :star_for_rating_minimum,
                  :rating_key,
                  :default_emoji,
                  :comment_character,
                  :dnf_string,
                  :reverse_dates,
                  :skip_compact_planned)
  end

  def visibility_params
    params.require(:visibility_config)
          .permit(:minimum_rating,
                  :hidden_genres_string,
                  :formats_visible,
                  :group_experiences_visible,
                  :planned_visible,
                  :public_notes_visible,
                  :private_notes_visible)
  end

  def account_params
    params.require(:user).permit(:username,
                                  :password,
                                  :password_confirmation)
  end

end